"""Liveness and configuration health."""

from __future__ import annotations

from fastapi import APIRouter, Request

from app.models.common import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/healthz", response_model=HealthResponse, response_model_by_alias=True)
async def healthz(request: Request) -> HealthResponse:
    settings = request.app.state.settings
    return HealthResponse(
        status="ok",
        version=settings.app_version,
        environment=settings.environment,
        auth="firebase",
        model=settings.resolved_model,
    )
