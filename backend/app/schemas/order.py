"""Order and purchase API schemas."""

import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus


class CheckoutCreate(BaseModel):
    """Input payload for creating a checkout session."""

    prompt_id: uuid.UUID = Field(..., description="ID of the prompt to purchase")


class CheckoutResponse(BaseModel):
    """Response returned when checkout session is initiated."""

    checkout_url: str = Field(..., description="URL to redirect user for payment")
    session_id: str = Field(..., description="Stripe checkout session ID")
    order_id: uuid.UUID = Field(..., description="Internal Order UUID")


class OrderItemRead(BaseModel):
    """Details of a purchased order item for buyer history."""

    id: uuid.UUID
    order_id: uuid.UUID
    prompt_id: uuid.UUID
    seller_id: uuid.UUID
    price_at_purchase: float
    created_at: datetime
    prompt_title: str
    prompt_short_description: str
    prompt_cover_image_url: Optional[str] = None
    prompt_category_name: str
    seller_name: str
    seller_avatar_url: Optional[str] = None
    order_status: OrderStatus

    model_config = ConfigDict(from_attributes=True)


class PaginatedPurchasesRead(BaseModel):
    """Paginated list of buyer purchases."""

    items: List[OrderItemRead]
    total: int
    page: int
    limit: int


class SellerSaleItemRead(BaseModel):
    """Summary of a recent sale for seller stats."""

    id: uuid.UUID
    prompt_id: uuid.UUID
    prompt_title: str
    price_at_purchase: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SellerStatsResponse(BaseModel):
    """Overall sales metrics and recent orders for seller dashboard."""

    sales_count: int
    total_revenue: float
    latest_orders: List[SellerSaleItemRead]
