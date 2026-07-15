"""Category repository."""

from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category


class CategoryRepository:
    """Repository for category-related database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> List[Category]:
        """Get all categories."""
        stmt = select(Category).order_by(Category.name)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
