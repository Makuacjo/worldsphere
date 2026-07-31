"""Small in-process limiter for credential endpoints."""
from __future__ import annotations
import os
import threading
import time
from collections import defaultdict, deque
from fastapi import HTTPException, Request

_LOCK = threading.Lock()
_EVENTS: dict[str, deque[float]] = defaultdict(deque)

def enforce(request: Request) -> None:
    limit = int(os.getenv("AUTH_RATE_LIMIT_PER_MINUTE", "10"))
    address = request.client.host if request.client else "unknown"
    key = f"{request.url.path}:{address}"
    now = time.monotonic()
    with _LOCK:
        events = _EVENTS[key]
        while events and events[0] <= now - 60:
            events.popleft()
        if len(events) >= limit:
            raise HTTPException(status_code=429, detail="Too many attempts. Try again shortly.")
        events.append(now)
