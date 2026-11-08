"""Logging setup.

Logs never include message content, screenshots, or extracted file text. Only
metadata needed to operate the service is emitted.
"""

from __future__ import annotations

import logging
import sys


def configure_logging(level: str = "INFO") -> None:
    root = logging.getLogger()
    if root.handlers:
        root.setLevel(level.upper())
        return

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")
    )
    root.addHandler(handler)
    root.setLevel(level.upper())

    # These libraries are chatty and can log prompt content at DEBUG level.
    for noisy in ("httpx", "httpcore", "litellm", "LiteLLM", "firebase_admin"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
