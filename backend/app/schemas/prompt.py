"""Prompt schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.prompt import PromptStatus
from app.schemas.category import CategoryRead
from app.schemas.user import UserRead


class PromptBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    short_description: str = Field(..., min_length=10, max_length=500)
    full_description: str = Field(..., min_length=10)
    category_id: uuid.UUID
    price: float = Field(..., gt=0)
    cover_image_url: str | None = None
    additional_images: list[str] | None = Field(default=None)
    prompt_text: str | None = None


class PromptCreate(PromptBase):
    prompt_text: str = Field(..., min_length=1)


class PromptUpdate(BaseModel):
    title: str | None = Field(None, min_length=3, max_length=255)
    short_description: str | None = Field(None, min_length=10, max_length=500)
    full_description: str | None = Field(None, min_length=10)
    category_id: uuid.UUID | None = None
    price: float | None = Field(None, gt=0)
    cover_image_url: str | None = None
    additional_images: list[str] | None = Field(default=None)
    prompt_text: str | None = None
    status: PromptStatus | None = None


class PromptRead(PromptBase):
    id: uuid.UUID
    seller_id: uuid.UUID
    status: PromptStatus
    created_at: datetime
    updated_at: datetime
    seller: UserRead | None = None
    category: CategoryRead | None = None
    is_purchased: bool = False
    is_owner: bool = False

    model_config = ConfigDict(from_attributes=True)


class PaginatedPromptRead(BaseModel):
    items: list[PromptRead]
    total: int
    page: int
    limit: int
