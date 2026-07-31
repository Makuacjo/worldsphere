"""Assistant routing and shared response generation."""
from __future__ import annotations

from collections.abc import Iterator

from app.ai_core import client
from app.ai_core.registry import AssistantConfig
from app.ai_core.security import injection_warning
from app.ai_core.tools import build_tool_context


def provider_messages(
    config: AssistantConfig,
    messages: list[dict[str, str]],
    context: dict,
) -> list[dict[str, str]]:
    last_user = next((item["content"] for item in reversed(messages) if item["role"] == "user"), "")
    warning = injection_warning(last_user)
    system = config.system_prompt + build_tool_context(config, context)
    if warning:
        system += "\nSecurity notice for this request: " + warning
    return [{"role": "system", "content": system}, *messages]


def stream_response(
    config: AssistantConfig,
    messages: list[dict[str, str]],
    context: dict,
) -> Iterator[str]:
    yield from client.stream_chat(
        provider_messages(config, messages, context),
        max_tokens=2400 if config.type.value == "TOUR_GUIDE" else 1200,
    )
