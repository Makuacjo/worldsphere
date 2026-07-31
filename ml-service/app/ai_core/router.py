"""FastAPI routes for every WorldSphere assistant."""
from __future__ import annotations

import json
import logging
from collections.abc import Iterator

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app import account, auth, db
from app.ai_core import client, rate_limit, security, service, store
from app.ai_core.registry import AssistantType, assistant_configs, get_assistant

logger = logging.getLogger("worldsphere.ai")
router = APIRouter(prefix="/api/ai", tags=["AI"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    assistantType: AssistantType
    conversationId: str | None = None
    messages: list[ChatMessage]
    context: dict = Field(default_factory=dict)


class RenameRequest(BaseModel):
    assistantType: AssistantType
    title: str = Field(min_length=1, max_length=100)


class FeedbackRequest(BaseModel):
    messageId: str
    rating: int
    comment: str | None = Field(default=None, max_length=1000)


def optional_user(authorization: str | None = Header(default=None)) -> dict | None:
    if not authorization:
        return None
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header.")
    payload = auth.verify_token(authorization.split(" ", 1)[1].strip())
    if not payload:
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")
    with db.connect() as conn:
        row = conn.execute(
            "SELECT id, name, email FROM users WHERE id = %s AND email = %s",
            (payload["uid"], payload["email"]),
        ).fetchone()
    return dict(row) if row else None


def session_value(x_worldsphere_session: str | None = Header(default=None)) -> str:
    value = (x_worldsphere_session or "legacy-anonymous").strip()
    if len(value) < 8 or len(value) > 120:
        raise HTTPException(status_code=400, detail="Invalid AI session identifier.")
    return value


def _translate_store_error(exc: Exception) -> HTTPException:
    if isinstance(exc, store.AssistantMismatch):
        return HTTPException(status_code=409, detail=str(exc))
    return HTTPException(status_code=404, detail=str(exc))


@router.get("/assistants")
def assistants() -> list[dict]:
    """Public presentation config. System prompts are deliberately excluded."""
    return [
        {
            "type": config.type.value,
            "name": config.name,
            "description": config.description,
            "welcomeMessage": config.welcome_message,
            "suggestedQuestions": config.suggested_questions,
            "theme": {
                "icon": config.icon,
                "primaryColor": config.primary_color,
                "backgroundStyle": config.background_style,
            },
            "inputPlaceholder": config.input_placeholder,
        }
        for config in assistant_configs.values()
    ]


@router.post("/chat")
def chat(
    payload: ChatRequest,
    request: Request,
    user: dict | None = Depends(optional_user),
    session_id: str = Depends(session_value),
) -> StreamingResponse:
    if not client.available():
        raise HTTPException(
            status_code=503,
            detail="AI is not configured. Set OPENROUTER_API_KEY in the ml-service environment.",
        )
    config = get_assistant(payload.assistantType)
    try:
        messages = security.validate_messages([item.model_dump() for item in payload.messages])
        context = security.safe_context(payload.context)
        rate_key = f"user:{user['id']}" if user else f"session:{session_id}"
        rate_limit.check(rate_key)
    except security.SecurityError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except rate_limit.RateLimitError as exc:
        raise HTTPException(status_code=429, detail=str(exc)) from exc

    user_id = user["id"] if user else None
    conversation_id = payload.conversationId
    try:
        if conversation_id:
            store.require_conversation(
                conversation_id, payload.assistantType, user_id, session_id
            )
        else:
            first_user = next(item["content"] for item in messages if item["role"] == "user")
            conversation_id = store.create_conversation(
                payload.assistantType, user_id, session_id, first_user[:72]
            )
    except (store.ConversationNotFound, store.AssistantMismatch) as exc:
        raise _translate_store_error(exc) from exc

    latest = messages[-1]["content"]
    user_message_id = store.add_message(conversation_id, "user", latest)
    if user:
        account.activity(user["id"], "ai_conversation_continued" if payload.conversationId else "ai_conversation_started", first_user[:72] if not payload.conversationId else latest[:72], "conversation", conversation_id)
    input_chars = sum(len(item["content"]) for item in messages)

    def generate() -> Iterator[str]:
        chunks: list[str] = []
        try:
            for chunk in service.stream_response(config, messages, context):
                chunks.append(chunk)
                yield chunk
        except client.ProviderError as exc:
            logger.warning("OpenRouter stream failed assistant=%s error=%s", config.type.value, exc)
            fallback = "\n\nThe AI service is temporarily unavailable. Please try again."
            chunks.append(fallback)
            yield fallback
        finally:
            answer = "".join(chunks).strip()
            if answer:
                assistant_message_id = store.add_message(
                    conversation_id,
                    "assistant",
                    answer,
                    {"replyTo": user_message_id, "model": client.MODEL},
                )
                store.record_usage(
                    conversation_id, payload.assistantType, input_chars, len(answer)
                )
                logger.info(
                    "AI response assistant=%s conversation=%s message=%s input_chars=%s output_chars=%s",
                    config.type.value, conversation_id, assistant_message_id,
                    input_chars, len(answer),
                )

    return StreamingResponse(
        generate(),
        media_type="text/plain; charset=utf-8",
        headers={
            "X-Conversation-Id": conversation_id,
            "X-Assistant-Type": payload.assistantType.value,
            "Cache-Control": "no-store",
        },
    )


@router.get("/conversations")
def conversations(
    assistantType: AssistantType,
    search: str = Query(default="", max_length=100),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: dict | None = Depends(optional_user),
    session_id: str = Depends(session_value),
) -> list[dict]:
    return store.list_conversations(
        assistantType, user["id"] if user else None, session_id,
        search=search.strip(), limit=limit, offset=offset,
    )


@router.post("/conversations/claim")
def claim_conversations(
    user: dict = Depends(auth.current_user),
    session_id: str = Depends(session_value),
) -> dict:
    return {"claimed": store.claim_anonymous_conversations(user["id"], session_id)}


@router.get("/conversations/{conversation_id}")
def conversation(
    conversation_id: str,
    assistantType: AssistantType,
    user: dict | None = Depends(optional_user),
    session_id: str = Depends(session_value),
) -> dict:
    try:
        return store.get_conversation(
            conversation_id, assistantType, user["id"] if user else None, session_id
        )
    except (store.ConversationNotFound, store.AssistantMismatch) as exc:
        raise _translate_store_error(exc) from exc


@router.patch("/conversations/{conversation_id}")
def rename(
    conversation_id: str,
    payload: RenameRequest,
    user: dict | None = Depends(optional_user),
    session_id: str = Depends(session_value),
) -> dict:
    try:
        store.rename_conversation(
            conversation_id, payload.assistantType,
            user["id"] if user else None, session_id, payload.title.strip(),
        )
    except (store.ConversationNotFound, store.AssistantMismatch) as exc:
        raise _translate_store_error(exc) from exc
    return {"ok": True}


@router.delete("/conversations/{conversation_id}")
def delete(
    conversation_id: str,
    assistantType: AssistantType,
    user: dict | None = Depends(optional_user),
    session_id: str = Depends(session_value),
) -> dict:
    try:
        store.delete_conversation(
            conversation_id, assistantType, user["id"] if user else None, session_id
        )
    except (store.ConversationNotFound, store.AssistantMismatch) as exc:
        raise _translate_store_error(exc) from exc
    return {"ok": True}


@router.post("/feedback")
def feedback(
    payload: FeedbackRequest,
    user: dict | None = Depends(optional_user),
    session_id: str = Depends(session_value),
) -> dict:
    if payload.rating not in (-1, 1):
        raise HTTPException(status_code=422, detail="Feedback rating must be -1 or 1.")
    try:
        store.record_feedback(
            payload.messageId,
            payload.rating,
            payload.comment,
            user["id"] if user else None,
            session_id,
        )
    except store.ConversationNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"ok": True}
