"""Uniform API errors.

Every failure leaves the service through this type so clients always receive
the same ``{"ok": false, "error": {...}}`` envelope.
"""

from __future__ import annotations

from collections.abc import Mapping


class ApiError(Exception):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        headers: Mapping[str, str] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.headers = dict(headers or {})


class InvalidTokenError(Exception):
    """Raised when a Firebase ID token is missing, expired, or forged."""


class AuthNotConfiguredError(Exception):
    """Raised when Firebase credentials are unavailable on the server."""
