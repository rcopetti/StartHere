"""Process-local sliding-window rate limiting.

The API is stateless by design, so limits are per instance. Deployments that
run more than one replica should move this to a shared store.
"""

from __future__ import annotations

import time
from collections import defaultdict, deque
from threading import Lock

WINDOW_SECONDS = 3600.0


class InMemoryRateLimiter:
    def __init__(self, window_seconds: float = WINDOW_SECONDS) -> None:
        self._window = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def hit(self, key: str, limit: int) -> tuple[bool, int]:
        """Record a hit and report whether it is allowed.

        Returns ``(allowed, retry_after_seconds)``. A limit of zero disables
        rate limiting.
        """
        if limit <= 0:
            return True, 0

        now = time.monotonic()
        cutoff = now - self._window

        with self._lock:
            hits = self._hits[key]
            while hits and hits[0] <= cutoff:
                hits.popleft()

            if len(hits) >= limit:
                retry_after = max(1, int(hits[0] + self._window - now) + 1)
                return False, retry_after

            hits.append(now)
            return True, 0

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()
