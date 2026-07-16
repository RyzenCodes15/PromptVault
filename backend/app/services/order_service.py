"""Order service layer."""

import uuid
from typing import Any, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.integrations.stripe import StripeService
from app.models.order import Order, OrderItem, OrderStatus, Payment, PaymentStatus
from app.models.prompt import PromptStatus
from app.models.user import User, UserRole
from app.repositories.order_repository import OrderRepository
from app.repositories.prompt_repository import PromptRepository
from app.schemas.order import (
    CheckoutResponse,
    OrderItemRead,
    PaginatedPurchasesRead,
    SellerSaleItemRead,
    SellerStatsResponse,
)

settings = get_settings()


def _get_val(obj: Any, key: str, default: Any = None) -> Any:
    if isinstance(obj, dict):
        return obj.get(key, default)
    try:
        val = getattr(obj, key, default)
        return default if val is None else val
    except (AttributeError, KeyError):
        return default


class OrderService:
    """Service handling checkout sessions, webhooks, and order queries."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repository = OrderRepository(session)
        self.prompt_repo = PromptRepository(session)
        self.stripe_service = StripeService(
            secret_key=settings.stripe_secret_key,
            webhook_secret=settings.stripe_webhook_secret,
        )

    async def create_checkout_session(self, user: User, prompt_id: uuid.UUID) -> CheckoutResponse:
        """Initiate a purchase by creating an Order and Stripe Checkout Session."""
        if user.role != UserRole.buyer:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sellers cannot buy prompts. Please use a buyer account.",
            )

        prompt = await self.prompt_repo.get_by_id(prompt_id)
        if not prompt or prompt.status != PromptStatus.active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prompt not found or currently unavailable.",
            )

        if user.id == prompt.seller_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot purchase your own prompt.",
            )

        has_purchased = await self.repository.has_purchased_prompt(user.id, prompt_id)
        if has_purchased:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already purchased this prompt.",
            )

        # Create Order, OrderItem, and Payment records
        order = Order(
            buyer_id=user.id,
            status=OrderStatus.pending,
            total_amount=prompt.price,
        )
        await self.repository.create_order(order)

        item = OrderItem(
            order_id=order.id,
            prompt_id=prompt.id,
            seller_id=prompt.seller_id,
            price_at_purchase=prompt.price,
        )
        await self.repository.create_order_item(item)

        payment = Payment(
            order_id=order.id,
            amount=prompt.price,
            currency="inr",
            status=PaymentStatus.pending,
        )
        await self.repository.create_payment(payment)

        # Create Stripe Checkout Session
        frontend_url = settings.frontend_url.rstrip("/")
        success_url = f"{frontend_url}/marketplace/orders/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{frontend_url}/marketplace/orders/cancel?session_id={{CHECKOUT_SESSION_ID}}"

        stripe_session = await self.stripe_service.create_checkout_session(
            price_amount=prompt.price,
            currency="inr",
            success_url=success_url,
            cancel_url=cancel_url,
            product_name=prompt.title,
            product_description=prompt.short_description,
            metadata={
                "order_id": str(order.id),
                "buyer_id": str(user.id),
                "prompt_id": str(prompt.id),
                "seller_id": str(prompt.seller_id),
            },
        )

        order.stripe_checkout_session_id = stripe_session["id"]
        await self.repository.update_order(order)

        # If in mock mode, automatically fulfill order so developers/reviewers can test without tunneling
        if stripe_session["id"].startswith("cs_test_mock_"):
            order.status = OrderStatus.completed
            if order.payment:
                order.payment.status = PaymentStatus.succeeded
                order.payment.stripe_payment_intent_id = f"pi_mock_{uuid.uuid4().hex}"
            await self.repository.update_order(order)

        return CheckoutResponse(
            checkout_url=stripe_session["url"],
            session_id=stripe_session["id"],
            order_id=order.id,
        )

    async def handle_webhook(self, payload: bytes, signature: str) -> None:
        """Process verified Stripe webhook events."""
        event = await self.stripe_service.verify_webhook(payload, signature)
        if not event:
            return

        event_type = _get_val(event, "type")
        data = _get_val(event, "data", {})
        data_object = _get_val(data, "object", {})

        # Handle both standard Stripe event format and mock dict format
        if not event_type and _get_val(event, "id"):
            session_id = _get_val(event, "id", "")
            metadata = _get_val(event, "metadata", {})
            order_id_str = _get_val(metadata, "order_id")
        else:
            session_id = _get_val(data_object, "id", "")
            metadata = _get_val(data_object, "metadata", {})
            order_id_str = _get_val(metadata, "order_id")

        if event_type in ("checkout.session.completed", "checkout.session.async_payment_succeeded") or (not event_type and session_id.startswith("cs_test_mock_")):
            order: Optional[Order] = None
            if order_id_str:
                try:
                    order = await self.repository.get_order_by_id(uuid.UUID(order_id_str))
                except ValueError:
                    pass
            if not order and session_id:
                order = await self.repository.get_order_by_checkout_session_id(session_id)

            if order and order.status != OrderStatus.completed:
                order.status = OrderStatus.completed
                if order.payment:
                    order.payment.status = PaymentStatus.succeeded
                    payment_intent = _get_val(data_object, "payment_intent") or f"pi_mock_{uuid.uuid4().hex}"
                    order.payment.stripe_payment_intent_id = payment_intent
                await self.repository.update_order(order)

        elif event_type in ["checkout.session.async_payment_failed", "checkout.session.expired"]:
            order = None
            if order_id_str:
                try:
                    order = await self.repository.get_order_by_id(uuid.UUID(order_id_str))
                except ValueError:
                    pass
            if not order and session_id:
                order = await self.repository.get_order_by_checkout_session_id(session_id)

            if order:
                order.status = OrderStatus.failed
                if order.payment:
                    order.payment.status = PaymentStatus.failed
                await self.repository.update_order(order)

    async def get_buyer_purchases(
        self, user: User, page: int = 1, limit: int = 20
    ) -> PaginatedPurchasesRead:
        """Get paginated list of purchase history for the buyer."""
        if user.role != UserRole.buyer:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only buyers have purchase histories.",
            )

        page = max(1, page)
        limit = min(50, max(1, limit))

        items, total = await self.repository.get_buyer_purchases(user.id, page, limit)

        item_reads = []
        for item in items:
            category_name = item.prompt.category.name if item.prompt and item.prompt.category else "Uncategorized"
            prompt_title = item.prompt.title if item.prompt else "Deleted Prompt"
            prompt_short_desc = item.prompt.short_description if item.prompt else ""
            prompt_image = item.prompt.cover_image_url if item.prompt else None
            seller_name = item.seller.name if item.seller else "Unknown Seller"
            seller_avatar = item.seller.avatar_url if item.seller else None
            order_status = item.order.status if item.order else OrderStatus.completed

            item_reads.append(
                OrderItemRead(
                    id=item.id,
                    order_id=item.order_id,
                    prompt_id=item.prompt_id,
                    seller_id=item.seller_id,
                    price_at_purchase=float(item.price_at_purchase),
                    created_at=item.created_at,
                    prompt_title=prompt_title,
                    prompt_short_description=prompt_short_desc,
                    prompt_cover_image_url=prompt_image,
                    prompt_category_name=category_name,
                    seller_name=seller_name,
                    seller_avatar_url=seller_avatar,
                    order_status=order_status,
                )
            )

        return PaginatedPurchasesRead(
            items=item_reads,
            total=total,
            page=page,
            limit=limit,
        )

    async def get_seller_stats(self, user: User) -> SellerStatsResponse:
        """Get sales metrics and recent orders for the seller."""
        if user.role != UserRole.seller:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only sellers can access sales statistics.",
            )

        sales_count, total_revenue, recent_items = await self.repository.get_seller_sales_stats(user.id)

        latest = []
        for item in recent_items:
            latest.append(
                SellerSaleItemRead(
                    id=item.id,
                    prompt_id=item.prompt_id,
                    prompt_title=item.prompt.title if item.prompt else "Deleted Prompt",
                    price_at_purchase=float(item.price_at_purchase),
                    created_at=item.created_at,
                )
            )

        return SellerStatsResponse(
            sales_count=sales_count,
            total_revenue=total_revenue,
            latest_orders=latest,
        )

    async def verify_download_access(self, user: User, prompt_id: uuid.UUID) -> str:
        """Verify ownership/purchase access and return prompt text content for download."""
        prompt = await self.prompt_repo.get_by_id(prompt_id)
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prompt not found.",
            )

        # Sellers own their prompts
        if user.id == prompt.seller_id:
            return prompt.prompt_text or ""

        # Buyers must have completed purchase
        if user.role == UserRole.buyer:
            has_purchased = await self.repository.has_purchased_prompt(user.id, prompt_id)
            if has_purchased:
                return prompt.prompt_text or ""

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must purchase this prompt before downloading its files.",
        )
