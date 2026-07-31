"""Shared conversation, message, usage, feedback, and analytics storage."""
from __future__ import annotations

import json
import secrets

from app import db
from app.ai_core.registry import AssistantType


class ConversationNotFound(LookupError):
    pass


class AssistantMismatch(PermissionError):
    pass


def _owner_clause(user_id: int | None, session_id: str) -> tuple[str, tuple]:
    if user_id is not None:
        return "user_id = %s", (user_id,)
    return "user_id IS NULL AND session_id = %s", (session_id,)


def create_conversation(
    assistant_type: AssistantType,
    user_id: int | None,
    session_id: str,
    title: str | None = None,
) -> str:
    conversation_id = secrets.token_urlsafe(18)
    with db.connect() as conn:
        conn.execute(
            "INSERT INTO ai_conversations "
            "(id, user_id, session_id, assistant_type, title) VALUES (%s, %s, %s, %s, %s)",
            (conversation_id, user_id, session_id, assistant_type.value, title),
        )
    return conversation_id


def require_conversation(
    conversation_id: str,
    assistant_type: AssistantType,
    user_id: int | None,
    session_id: str,
):
    owner_sql, owner_args = _owner_clause(user_id, session_id)
    with db.connect() as conn:
        row = conn.execute(
            f"SELECT * FROM ai_conversations WHERE id = %s AND {owner_sql}",
            (conversation_id, *owner_args),
        ).fetchone()
    if not row:
        raise ConversationNotFound("Conversation not found.")
    if row["assistant_type"] != assistant_type.value:
        raise AssistantMismatch("This conversation belongs to a different assistant.")
    return row


def add_message(
    conversation_id: str,
    role: str,
    content: str,
    metadata: dict | None = None,
) -> str:
    message_id = secrets.token_urlsafe(15)
    with db.connect() as conn:
        conn.execute(
            "INSERT INTO ai_messages (id, conversation_id, role, content, metadata) "
            "VALUES (%s, %s, %s, %s, %s)",
            (message_id, conversation_id, role, content, json.dumps(metadata or {})),
        )
        conn.execute(
            "UPDATE ai_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (conversation_id,),
        )
    return message_id


def list_conversations(
    assistant_type: AssistantType,
    user_id: int | None,
    session_id: str,
) -> list[dict]:
    owner_sql, owner_args = _owner_clause(user_id, session_id)
    with db.connect() as conn:
        rows = conn.execute(
            f"SELECT c.id, c.assistant_type, c.title, c.created_at, c.updated_at, "
            "COALESCE((SELECT left(m.content, 180) FROM ai_messages m WHERE m.conversation_id=c.id "
            "ORDER BY m.created_at DESC, m.id DESC LIMIT 1), '') AS preview "
            f"FROM ai_conversations c WHERE {owner_sql} AND c.assistant_type = %s "
            "AND (%s = '' OR c.title ILIKE '%%' || %s || '%%') "
            "ORDER BY c.updated_at DESC LIMIT %s OFFSET %s",
            (*owner_args, assistant_type.value, search, search, min(max(limit, 1), 100), max(offset, 0)),
        ).fetchall()
    return [dict(row) for row in rows]


def get_conversation(
    conversation_id: str,
    assistant_type: AssistantType,
    user_id: int | None,
    session_id: str,
) -> dict:
    row = require_conversation(conversation_id, assistant_type, user_id, session_id)
    with db.connect() as conn:
        messages = conn.execute(
            "SELECT id, role, content, metadata, created_at FROM ai_messages "
            "WHERE conversation_id = %s ORDER BY created_at, id",
            (conversation_id,),
        ).fetchall()
    return {
        "id": row["id"],
        "assistantType": row["assistant_type"],
        "title": row["title"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
        "messages": [
            {
                "id": item["id"],
                "role": item["role"],
                "content": item["content"],
                "metadata": item["metadata"] if isinstance(item["metadata"], dict) else json.loads(item["metadata"] or "{}"),
                "createdAt": item["created_at"],
            }
            for item in messages
        ],
    }


def rename_conversation(
    conversation_id: str,
    assistant_type: AssistantType,
    user_id: int | None,
    session_id: str,
    title: str,
) -> None:
    require_conversation(conversation_id, assistant_type, user_id, session_id)
    with db.connect() as conn:
        conn.execute(
            "UPDATE ai_conversations SET title = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (title[:100], conversation_id),
        )


def delete_conversation(
    conversation_id: str,
    assistant_type: AssistantType,
    user_id: int | None,
    session_id: str,
) -> None:
    require_conversation(conversation_id, assistant_type, user_id, session_id)
    with db.connect() as conn:
        conn.execute("DELETE FROM ai_conversations WHERE id = %s", (conversation_id,))


def record_usage(
    conversation_id: str,
    assistant_type: AssistantType,
    input_chars: int,
    output_chars: int,
) -> None:
    with db.connect() as conn:
        conn.execute(
            "INSERT INTO ai_usage (conversation_id, assistant_type, input_chars, "
            "output_chars, estimated_input_tokens, estimated_output_tokens) "
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (
                conversation_id, assistant_type.value, input_chars, output_chars,
                max(1, input_chars // 4), max(1, output_chars // 4),
            ),
        )


def record_feedback(
    message_id: str,
    rating: int,
    comment: str | None,
    user_id: int | None,
    session_id: str,
) -> None:
    owner_sql, owner_args = _owner_clause(user_id, session_id)
    with db.connect() as conn:
        found = conn.execute(
            "SELECT m.id FROM ai_messages m "
            "JOIN ai_conversations c ON c.id = m.conversation_id "
            f"WHERE m.id = %s AND {owner_sql}",
            (message_id, *owner_args),
        ).fetchone()
        if not found:
            raise ConversationNotFound("Message not found.")
        conn.execute(
            "INSERT INTO ai_feedback (id, message_id, rating, comment) VALUES (%s, %s, %s, %s)",
            (secrets.token_urlsafe(12), message_id, rating, comment),
        )


def claim_anonymous_conversations(user_id: int, session_id: str) -> int:
    """Atomically attach only this browser session's anonymous chats to its signed-in user."""
    with db.connect() as conn:
        rows = conn.execute(
            "UPDATE ai_conversations SET user_id=%s, updated_at=CURRENT_TIMESTAMP "
            "WHERE user_id IS NULL AND session_id=%s RETURNING id",
            (user_id, session_id),
        ).fetchall()
    return len(rows)