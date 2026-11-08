"""FastAPI application factory."""

from __future__ import annotations

import logging
import time
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import health, scam_check
from app.config import Settings, get_settings
from app.core.errors import ApiError
from app.core.logging import configure_logging
from app.core.rate_limit import InMemoryRateLimiter
from app.models.common import ErrorDetail, ErrorResponse
from app.services.auth import FirebaseTokenVerifier
from app.services.llm import LlmClient
from app.services.scam_check import ScamCheckService

logger = logging.getLogger(__name__)

INVALID_REQUEST_MESSAGE = "Some of the information sent was not in the expected format."
INTERNAL_ERROR_MESSAGE = "Something went wrong on our side. Please try again."


def create_app(
    settings: Settings | None = None, llm_client: LlmClient | None = None
) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level)

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None if settings.is_production else "/redoc",
        openapi_url=None if settings.is_production else "/openapi.json",
    )

    app.state.settings = settings
    app.state.token_verifier = FirebaseTokenVerifier(settings)
    app.state.rate_limiter = InMemoryRateLimiter()

    if llm_client is None:
        from app.services.llm import LiteLlmClient

        llm_client = LiteLlmClient(settings)

    app.state.llm_client = llm_client
    app.state.scam_check_service = ScamCheckService(llm_client, settings)

    logger.info(
        "firebase_auth_configured project=%s emulator=%s",
        settings.firebase_project_id or "(missing)",
        bool(settings.firebase_auth_emulator_host),
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["POST", "GET", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
        expose_headers=["X-Request-ID", "Retry-After"],
    )

    app.include_router(health.router)
    app.include_router(scam_check.router, prefix=settings.api_prefix)

    _install_exception_handlers(app)
    _install_request_middleware(app)

    return app


def _install_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def handle_api_error(request: Request, exc: ApiError) -> JSONResponse:
        body = ErrorResponse(error=ErrorDetail(code=exc.code, message=exc.message))
        return JSONResponse(
            status_code=exc.status_code,
            content=body.model_dump(by_alias=True),
            headers=exc.headers or None,
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        body = ErrorResponse(
            error=ErrorDetail(code="invalid_request", message=INVALID_REQUEST_MESSAGE)
        )
        return JSONResponse(status_code=422, content=body.model_dump(by_alias=True))

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("unhandled_error type=%s", type(exc).__name__)
        body = ErrorResponse(
            error=ErrorDetail(code="internal_error", message=INTERNAL_ERROR_MESSAGE)
        )
        return JSONResponse(status_code=500, content=body.model_dump(by_alias=True))


def _install_request_middleware(app: FastAPI) -> None:
    @app.middleware("http")
    async def request_context(request: Request, call_next):
        request_id = request.headers.get("x-request-id") or uuid4().hex
        started = time.perf_counter()
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        logger.info(
            "request method=%s path=%s status=%d duration_ms=%d request_id=%s",
            request.method,
            request.url.path,
            response.status_code,
            int((time.perf_counter() - started) * 1000),
            request_id,
        )
        return response


app = create_app()
