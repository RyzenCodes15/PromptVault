"""Prompt schemas."""

import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

from app.models.prompt import PromptStatus
from app.schemas.user import UserRead
from app.schemas.category import CategoryRead


class PromptBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    short_description: str = Field(..., min_length=10, max_length=500)
    full_description: str = Field(..., min_length=10)
    category_id: uuid.UUID
    price: float = Field(..., gt=0)
    cover_image_url: Optional[str] = None
    prompt_file_url: Optional[str] = None


class PromptCreate(PromptBase):
    pass


class PromptUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    short_description: Optional[str] = Field(None, min_length=10, max_length=500)
    full_description: Optional[str] = Field(None, min_length=10)
    category_id: Optional[uuid.UUID] = None
    price: Optional[float] = Field(None, gt=0)
    cover_image_url: Optional[str] = None
    prompt_file_url: Optional[str] = None
    status: Optional[PromptStatus] = None


class PromptRead(PromptBase):
    id: uuid.UUID
    seller_id: uuid.UUID
    status: PromptStatus
    created_at: datetime
    updated_at: datetime
    seller: Optional[UserRead] = None
    category: Optional[CategoryRead] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedPromptRead(BaseModel):
    items: List[PromptRead]
    total: int
    page: int
    limit: int
