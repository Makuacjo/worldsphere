"""Claude-powered natural-language answers for the AI Explorer.

The Anthropic API key stays server-side — the browser never sees it. If the key
(or the SDK) is missing, `available()` returns False and the endpoint degrades
gracefully to a "not configured" message.
"""
from __future__ import annotations

import os
from typing import Iterator

# Default to the most capable model; override with AI_MODEL if desired.
MODEL = os.environ.get("AI_MODEL", "claude-opus-4-8")

SYSTEM = (
    "You are the WorldSphere field naturalist — a knowledgeable, warm guide to "
    "Earth's biodiversity, ecosystems, and conservation. Answer questions about "
    "animals, plants, waters, habitats, climate, and the natural world.\n\n"
    "Keep answers concise and vivid (usually 2-4 short paragraphs). Be accurate; "
    "if something is uncertain or outside biodiversity/conservation, say so briefly "
    "and steer back to the natural world. Light Markdown is welcome (short emphasis, "
    "the occasional list) but avoid big headings."
)


def available() -> bool:
    """True only if we can actually call Claude."""
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return False
    try:
        import anthropic  # noqa: F401
    except ImportError:
        return False
    return True


def stream_answer(question: str) -> Iterator[str]:
    """Yield the answer text token-by-token as it streams from Claude."""
    from anthropic import Anthropic

    client = Anthropic()
    with client.messages.stream(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM,
        messages=[{"role": "user", "content": question}],
    ) as stream:
        for text in stream.text_stream:
            yield text
