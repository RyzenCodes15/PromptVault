"""Consistent API response envelope."""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Standard API response wrapper for all endpoints."""

    success: bool
    data: T | None = None
    error: str | None = None
    detail: str | None = None

    @classmethod
    def ok(cls, data: Any = None) -> "ApiResponse":
        """Create a successful response."""
        return cls(success=True, data=data)

    @classmethod
    def fail(cls, error: str, detail: str | None = None) -> "ApiResponse":
        """Create an error response."""
        return cls(success=False, error=error, detail=detail)
