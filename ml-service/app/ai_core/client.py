"""Persistent OpenRouter streaming client shared by every assistant."""
from __future__ import annotations

import json
import logging
import os
import time
from collections.abc import Iterator

import httpx

from app.ai_core.env import load_env

load_env()

API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = os.environ.get("AI_MODEL", "openrouter/free")
PROVIDER_SORT = os.environ.get("AI_PROVIDER_SORT", "latency")
logger = logging.getLogger("worldsphere.ai.provider")

_http = httpx.Client(
    http2=True,
    limits=httpx.Limits(
        max_connections=20,
        max_keepalive_connections=10,
        keepalive_expiry=30,
    ),
    timeout=httpx.Timeout(
        connect=float(os.environ.get("AI_CONNECT_TIMEOUT_SECONDS", "5")),
        read=float(os.environ.get("AI_RESPONSE_TIMEOUT_SECONDS", "45")),
        write=10,
        pool=5,
    ),
)


class ProviderError(RuntimeError):
    pass


def available() -> bool:
    return bool(os.environ.get("OPENROUTER_API_KEY"))


def close() -> None:
    _http.close()


def stream_chat(messages: list[dict[str, str]], max_tokens: int = 1800) -> Iterator[str]:
    body = {
        "model": MODEL,
        "stream": True,
        "max_tokens": max_tokens,
        "messages": messages,
        "provider": {"sort": PROVIDER_SORT},
    }
    started = time.perf_counter()
    first_chunk_at: float | None = None
    try:
        with _http.stream(
            "POST",
            API_URL,
            json=body,
            headers={
                "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
                "Content-Type": "application/json",
                "Accept": "text/event-stream",
                "HTTP-Referer": os.environ.get("APP_URL", "http://localhost:5173"),
                "X-Title": "WorldSphere AI Explorer",
            },
        ) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                line = line.strip()
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
                    if first_chunk_at is None:
                        first_chunk_at = time.perf_counter()
                        logger.info(
                            "AI provider first_token_ms=%d model=%s input_messages=%d",
                            round((first_chunk_at - started) * 1000),
                            MODEL,
                            len(messages),
                        )
                    yield delta
        logger.info(
            "AI provider total_ms=%d model=%s",
            round((time.perf_counter() - started) * 1000),
            MODEL,
        )
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text[:300]
        raise ProviderError(
            f"OpenRouter request failed ({exc.response.status_code}). {detail}"
        ) from exc
    except httpx.HTTPError as exc:
        raise ProviderError(
            "The AI provider could not be reached. Please try again."
        ) from exc
