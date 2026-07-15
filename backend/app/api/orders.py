"""Orders and purchases API router."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_optional_user
from app.db.session import get_db_session
from app.models.user import User
from app.schemas.order import (
    CheckoutCreate,
    CheckoutResponse,
    PaginatedPurchasesRead,
    SellerStatsResponse,
)
from app.services.order_service import OrderService

router = APIRouter()


@router.post("/checkout", response_model=CheckoutResponse, status_code=status.HTTP_201_CREATED)
async def create_checkout(
    checkout_in: CheckoutCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """Initiate a Stripe Checkout session for purchasing a prompt."""
    service = OrderService(session)
    return await service.create_checkout_session(current_user, checkout_in.prompt_id)


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    session: AsyncSession = Depends(get_db_session),
):
    """Unauthenticated endpoint receiving Stripe webhook events."""
    payload = await request.body()
    if not stripe_signature:
        # In local/mock mode, signature might be empty or dummy
        stripe_signature = "mock_signature"

    service = OrderService(session)
    await service.handle_webhook(payload, stripe_signature)
    return {"status": "success"}


@router.get("/my-purchases", response_model=PaginatedPurchasesRead)
async def get_my_purchases(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=50, description="Items per page"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """Get purchase history for the authenticated buyer."""
    service = OrderService(session)
    return await service.get_buyer_purchases(current_user, page=page, limit=limit)


@router.get("/seller-stats", response_model=SellerStatsResponse)
async def get_seller_stats(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """Get sales metrics and recent orders for the authenticated seller."""
    service = OrderService(session)
    return await service.get_seller_stats(current_user)


@router.get("/check-purchase/{prompt_id}")
async def check_purchase_status(
    prompt_id: uuid.UUID,
    current_user: Optional[User] = Depends(get_optional_user),
    session: AsyncSession = Depends(get_db_session),
):
    """Check if the current user has purchased or owns the specified prompt."""
    if not current_user:
        return {"is_purchased": False, "is_owner": False}

    service = OrderService(session)
    prompt = await service.prompt_repo.get_by_id(prompt_id)
    if not prompt:
        return {"is_purchased": False, "is_owner": False}

    is_owner = current_user.id == prompt.seller_id
    if is_owner:
        return {"is_purchased": True, "is_owner": True}

    is_purchased = await service.repository.has_purchased_prompt(current_user.id, prompt_id)
    return {"is_purchased": is_purchased, "is_owner": False}
