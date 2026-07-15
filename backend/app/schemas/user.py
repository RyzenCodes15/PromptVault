"""User Pydantic schemas."""

import uuid
from datetime import datetime
from typing import Optional, Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.user import UserRole


class UserBase(BaseModel):
    """Base user properties."""

    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None

    @field_validator("email", mode="before")
    def lowercase_email(cls, v: Any) -> Any:
        if isinstance(v, str):
            return v.lower()
        return v


class UserCreate(UserBase):
    """Properties to receive via API on creation."""

    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = Field(default=UserRole.buyer)


class UserUpdate(BaseModel):
    """Properties to receive via API on update."""

    name: Optional[str] = Field(None, min_length=2, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)


class UserLogin(BaseModel):
    """Properties to receive via API on login."""

    email: EmailStr
    password: str


class UserRead(UserBase):
    """Properties to return via API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: UserRole
    created_at: datetime
    updated_at: datetime
