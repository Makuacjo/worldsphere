"""Validated server configuration helpers."""
from __future__ import annotations
import os
from urllib.parse import urlsplit

LOCAL_ORIGINS = ("http://localhost:5173", "http://127.0.0.1:5173",
                 "http://localhost:4173", "http://127.0.0.1:4173")

def parse_cors_origins(frontend_url: str | None = None, extra: str | None = None) -> list[str]:
    candidates = [*LOCAL_ORIGINS]
    candidates.extend((frontend_url or os.getenv("FRONTEND_URL", "")).split(","))
    candidates.extend((extra or os.getenv("CORS_ORIGINS", "")).split(","))
    origins: list[str] = []
    for value in candidates:
        value = value.strip().rstrip("/")
        if not value:
            continue
        parsed = urlsplit(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.path:
            raise RuntimeError(f"Invalid CORS origin: {value!r}")
        normalized = f"{parsed.scheme.lower()}://{parsed.netloc.lower()}"
        if normalized not in origins:
            origins.append(normalized)
    return origins

def validate_auth_secret() -> None:
    secret = os.getenv("AUTH_SECRET", "")
    if len(secret.encode()) < 32:
        raise RuntimeError("AUTH_SECRET is required and must contain at least 32 bytes.")
