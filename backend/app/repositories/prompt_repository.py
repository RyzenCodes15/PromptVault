"""Prompt repository."""

import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select, or_, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.prompt import Prompt, PromptStatus


class PromptRepository:
    """Repository for prompt-related database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, prompt: Prompt) -> Prompt:
        """Create a new prompt."""
        self.session.add(prompt)
        await self.session.commit()
        await self.session.refresh(prompt)
        # load relationships
        stmt = (
            select(Prompt)
            .options(selectinload(Prompt.seller), selectinload(Prompt.category))
            .where(Prompt.id == prompt.id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def get_by_id(self, prompt_id: uuid.UUID) -> Optional[Prompt]:
        """Get a prompt by ID."""
        stmt = (
            select(Prompt)
            .options(selectinload(Prompt.seller), selectinload(Prompt.category))
            .where(Prompt.id == prompt_id)
            .where(Prompt.status != PromptStatus.deleted)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def search(
        self,
        search_query: Optional[str] = None,
        category_id: Optional[uuid.UUID] = None,
        seller_id: Optional[uuid.UUID] = None,
        page: int = 1,
        limit: int = 12,
    ) -> Tuple[List[Prompt], int]:
        """Search and paginate prompts."""
        base_stmt = select(Prompt).where(Prompt.status == PromptStatus.active)
        
        if category_id:
            base_stmt = base_stmt.where(Prompt.category_id == category_id)
        
        if seller_id:
            base_stmt = base_stmt.where(Prompt.seller_id == seller_id)
            
        if search_query:
            search_term = f"%{search_query}%"
            base_stmt = base_stmt.where(
                or_(
                    Prompt.title.ilike(search_term),
                    Prompt.short_description.ilike(search_term),
                )
            )

        # Count total
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar_one()

        # Get paginated items
        items_stmt = (
            base_stmt
            .options(selectinload(Prompt.seller), selectinload(Prompt.category))
            .order_by(desc(Prompt.created_at))
            .offset((page - 1) * limit)
            .limit(limit)
        )
        
        items_result = await self.session.execute(items_stmt)
        items = list(items_result.scalars().all())

        return items, total
