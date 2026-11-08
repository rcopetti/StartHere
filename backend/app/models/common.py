"""Shared API models."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ApiModel(BaseModel):
    """Camel-case JSON to match the TypeScript client types."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class ErrorDetail(ApiModel):
    code: str
    message: str


class ErrorResponse(ApiModel):
    ok: bool = False
    error: ErrorDetail


class HealthResponse(ApiModel):
    status: str
    version: str
    environment: str
    auth: str
    model: str
