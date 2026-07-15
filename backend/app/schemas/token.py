"""JWT Token schemas."""

from pydantic import BaseModel


class Token(BaseModel):
    """Access and refresh token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Payload stored in the JWT."""

    sub: str
    type: str  # "access" or "refresh"
    exp: int


class RefreshTokenRequest(BaseModel):
    """Request model for refreshing a token."""

    refresh_token: str
