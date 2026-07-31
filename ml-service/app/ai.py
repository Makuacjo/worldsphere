"""Backward-compatible Species AI facade using shared OpenRouter infrastructure."""
from __future__ import annotations

from collections.abc import Iterator

from app.ai_core import client, service
from app.ai_core.registry import AssistantType, get_assistant


def available() -> bool:
    return client.available()


def stream_answer(question: str) -> Iterator[str]:
    yield from service.stream_response(
        get_assistant(AssistantType.SPECIES),
        [{"role": "user", "content": question}],
        {},
    )
