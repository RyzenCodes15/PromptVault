"""Order repository layer."""

import uuid
from typing import List, Optional, Tuple
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem, OrderStatus, Payment


class OrderRepository:
    """Repository for database operations on orders, order items, and payments."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_order(self, order: Order) -> Order:
        """Create a new order record."""
        self.session.add(order)
        await self.session.commit()
        await self.session.refresh(order)
        return order

    async def create_order_item(self, item: OrderItem) -> OrderItem:
        """Create an order item record."""
        self.session.add(item)
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def create_payment(self, payment: Payment) -> Payment:
        """Create a payment record."""
        self.session.add(payment)
        await self.session.commit()
        await self.session.refresh(payment)
        return payment

    async def get_order_by_id(self, order_id: uuid.UUID) -> Optional[Order]:
        """Get an order by its ID with relationships loaded."""
        stmt = (
            select(Order)
            .options(
                selectinload(Order.items).selectinload(OrderItem.prompt),
                selectinload(Order.items).selectinload(OrderItem.seller),
                selectinload(Order.payment),
                selectinload(Order.buyer),
            )
            .where(Order.id == order_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_order_by_checkout_session_id(self, session_id: str) -> Optional[Order]:
        """Get an order by its Stripe checkout session ID."""
        stmt = (
            select(Order)
            .options(
                selectinload(Order.items).selectinload(OrderItem.prompt),
                selectinload(Order.payment),
            )
            .where(Order.stripe_checkout_session_id == session_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def has_purchased_prompt(self, buyer_id: uuid.UUID, prompt_id: uuid.UUID) -> bool:
        """Check if a buyer has successfully completed an order for the given prompt."""
        stmt = (
            select(func.count(OrderItem.id))
            .join(Order, OrderItem.order_id == Order.id)
            .where(
                Order.buyer_id == buyer_id,
                Order.status == OrderStatus.completed,
                OrderItem.prompt_id == prompt_id,
            )
        )
        result = await self.session.execute(stmt)
        count = result.scalar_one_or_none() or 0
        return count > 0

    async def get_buyer_purchases(
        self, buyer_id: uuid.UUID, page: int = 1, limit: int = 20
    ) -> Tuple[List[OrderItem], int]:
        """Get paginated list of order items purchased by the buyer."""
        offset = (page - 1) * limit

        # Count total items
        count_stmt = (
            select(func.count(OrderItem.id))
            .join(Order, OrderItem.order_id == Order.id)
            .where(Order.buyer_id == buyer_id, Order.status == OrderStatus.completed)
        )
        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar_one_or_none() or 0

        # Fetch paginated order items
        stmt = (
            select(OrderItem)
            .join(Order, OrderItem.order_id == Order.id)
            .options(
                selectinload(OrderItem.prompt),
                selectinload(OrderItem.seller),
                selectinload(OrderItem.order),
            )
            .where(Order.buyer_id == buyer_id, Order.status == OrderStatus.completed)
            .order_by(desc(OrderItem.created_at))
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def get_seller_sales_stats(
        self, seller_id: uuid.UUID
    ) -> Tuple[int, float, List[OrderItem]]:
        """Get seller sales stats: sales count, total revenue, and recent items."""
        # Total sales count and revenue
        stats_stmt = (
            select(
                func.count(OrderItem.id),
                func.coalesce(func.sum(OrderItem.price_at_purchase), 0),
            )
            .join(Order, OrderItem.order_id == Order.id)
            .where(OrderItem.seller_id == seller_id, Order.status == OrderStatus.completed)
        )
        stats_result = await self.session.execute(stats_stmt)
        row = stats_result.one()
        sales_count = row[0] or 0
        total_revenue = float(row[1] or 0)

        # Recent 10 sales
        recent_stmt = (
            select(OrderItem)
            .join(Order, OrderItem.order_id == Order.id)
            .options(
                selectinload(OrderItem.prompt),
                selectinload(OrderItem.order).selectinload(Order.buyer),
            )
            .where(OrderItem.seller_id == seller_id, Order.status == OrderStatus.completed)
            .order_by(desc(OrderItem.created_at))
            .limit(10)
        )
        recent_result = await self.session.execute(recent_stmt)
        recent_items = list(recent_result.scalars().all())

        return sales_count, total_revenue, recent_items

    async def update_order(self, order: Order) -> Order:
        """Update and commit order modifications."""
        await self.session.commit()
        await self.session.refresh(order)
        return order

    async def update_payment(self, payment: Payment) -> Payment:
        """Update and commit payment modifications."""
        await self.session.commit()
        await self.session.refresh(payment)
        return payment
