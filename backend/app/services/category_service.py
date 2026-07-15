"""Category service layer."""

from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.repositories.category_repository import CategoryRepository


class CategoryService:
    """Service for category operations."""

    def __init__(self, session: AsyncSession):
        self.repository = CategoryRepository(session)

    async def get_all_categories(self) -> List[Category]:
        """Get all categories."""
        return await self.repository.get_all()
