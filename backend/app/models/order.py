"""Order, OrderItem, and Payment database models."""

import enum
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class OrderStatus(str, enum.Enum):
    """Enumeration of order statuses."""

    pending = "pending"
    completed = "completed"
    cancelled = "cancelled"
    failed = "failed"


class PaymentStatus(str, enum.Enum):
    """Enumeration of payment statuses."""

    pending = "pending"
    succeeded = "succeeded"
    failed = "failed"
    refunded = "refunded"


class Order(Base):
    """Order database model."""

    __tablename__ = "orders"

    __table_args__ = (
        Index("ix_orders_stripe_checkout_session_id", "stripe_checkout_session_id", unique=True),
        Index("ix_orders_buyer_id", "buyer_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    buyer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, name="order_status_enum", create_type=False),
        nullable=False,
        default=OrderStatus.pending,
    )
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    stripe_checkout_session_id: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
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
    buyer = relationship("User", foreign_keys=[buyer_id], lazy="selectin")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan", lazy="selectin")
    payment = relationship("Payment", back_populates="order", uselist=False, cascade="all, delete-orphan", lazy="selectin")


class OrderItem(Base):
    """OrderItem database model."""

    __tablename__ = "order_items"

    __table_args__ = (
        Index("ix_order_items_order_id", "order_id"),
        Index("ix_order_items_prompt_id", "prompt_id"),
        Index("ix_order_items_seller_id", "seller_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    prompt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("prompts.id", ondelete="RESTRICT"), nullable=False
    )
    seller_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    price_at_purchase: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    order = relationship("Order", back_populates="items", lazy="selectin")
    prompt = relationship("Prompt", lazy="selectin")
    seller = relationship("User", foreign_keys=[seller_id], lazy="selectin")


class Payment(Base):
    """Payment database model."""

    __tablename__ = "payments"

    __table_args__ = (
        Index("ix_payments_stripe_payment_intent_id", "stripe_payment_intent_id", unique=True),
        Index("ix_payments_order_id", "order_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    stripe_payment_intent_id: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="inr")
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="payment_status_enum", create_type=False),
        nullable=False,
        default=PaymentStatus.pending,
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
    order = relationship("Order", back_populates="payment", lazy="selectin")
