"""Natural-language answers for the AI Explorer, via OpenRouter.

OpenRouter exposes an OpenAI-compatible Chat Completions API, so this uses plain
HTTP (stdlib urllib) rather than a vendor SDK. The API key stays server-side.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Iterator

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # ml-service/


def _load_env() -> None:
    """Load ml-service/.env (gitignored) into the environment if present."""
    path = os.path.join(_ROOT, ".env")
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_env()

API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = os.environ.get("AI_MODEL", "openai/gpt-4o-mini")

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
    return bool(os.environ.get("OPENROUTER_API_KEY"))


def stream_answer(question: str) -> Iterator[str]:
    """Yield answer text as it streams from OpenRouter (SSE deltas)."""
    body = json.dumps({
        "model": MODEL,
        "stream": True,
        "max_tokens": 1024,
        "messages": [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": question},
        ],
    }).encode()

    req = urllib.request.Request(
        API_URL,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
            "Content-Type": "application/json",
            # OpenRouter attribution headers (optional but recommended).
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "WorldSphere",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            for raw in resp:
                line = raw.decode("utf-8", "ignore").strip()
                if not line or not line.startswith("data:"):
                    continue
                data = line[5:].strip()
                if data == "[DONE]":
                    break
                try:
                    chunk = json.loads(data)
                except json.JSONDecodeError:
                    continue
                delta = (chunk.get("choices") or [{}])[0].get("delta", {}).get("content")
                if delta:
                    yield delta
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "ignore")[:300]
        yield f"\n\n_AI request failed ({e.code}). {detail}_"
    except Exception as e:  # network / timeout
        yield f"\n\n_AI request error: {e}_"
