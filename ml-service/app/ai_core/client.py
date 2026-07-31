"""One shared OpenRouter streaming client for every assistant."""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from collections.abc import Iterator

from app.ai_core.env import load_env

load_env()

API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = os.environ.get("AI_MODEL", "openrouter/free")


class ProviderError(RuntimeError):
    pass


def available() -> bool:
    return bool(os.environ.get("OPENROUTER_API_KEY"))


def stream_chat(messages: list[dict[str, str]], max_tokens: int = 1800) -> Iterator[str]:
    body = json.dumps({
        "model": MODEL,
        "stream": True,
        "max_tokens": max_tokens,
        "messages": messages,
    }).encode()
    request = urllib.request.Request(
        API_URL,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
            "Content-Type": "application/json",
            "HTTP-Referer": os.environ.get("APP_URL", "http://localhost:5173"),
            "X-Title": "WorldSphere AI Explorer",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            for raw in response:
                line = raw.decode("utf-8", "ignore").strip()
                if not line.startswith("data:"):
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
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "ignore")[:300]
        raise ProviderError(f"OpenRouter request failed ({exc.code}). {detail}") from exc
    except Exception as exc:
        raise ProviderError("The AI provider could not be reached. Please try again.") from exc
