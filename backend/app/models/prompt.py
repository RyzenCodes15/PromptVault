"""Prompt database model."""

import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class PromptStatus(str, enum.Enum):
    """Enumeration of prompt statuses."""

    active = "active"
    inactive = "inactive"
    deleted = "deleted"


class Prompt(Base):
    """Prompt database model."""

    __tablename__ = "prompts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    seller_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False
    )
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    short_description: Mapped[str] = mapped_column(String(500), nullable=False)
    full_description: Mapped[str] = mapped_column(Text, nullable=False)
    
    cover_image_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    prompt_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    
    status: Mapped[PromptStatus] = mapped_column(
        Enum(PromptStatus, name="prompt_status_enum", create_type=False),
        nullable=False,
        default=PromptStatus.active,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    seller = relationship("User", back_populates="prompts", lazy="selectin")
    category = relationship("Category", back_populates="prompts", lazy="selectin")
