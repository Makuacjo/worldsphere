"""Small shared in-memory sliding-window limiter.

For multi-instance production deployment, replace the store with Redis while
keeping the same check() interface.
"""
from __future__ import annotations

import os
import threading
import time
from collections import defaultdict, deque

_WINDOW_SECONDS = 60
_LIMIT = int(os.environ.get("AI_RATE_LIMIT_PER_MINUTE", "20"))
_events: dict[str, deque[float]] = defaultdict(deque)
_lock = threading.Lock()


class RateLimitError(RuntimeError):
    pass


def check(key: str) -> None:
    now = time.time()
    with _lock:
        events = _events[key]
        while events and events[0] <= now - _WINDOW_SECONDS:
            events.popleft()
        if len(events) >= _LIMIT:
            raise RateLimitError("AI rate limit reached. Please wait a moment and try again.")
        events.append(now)


def reset_for_tests() -> None:
    with _lock:
        _events.clear()
