"""Prompt service layer."""

import uuid
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.prompt import Prompt
from app.models.user import User, UserRole
from app.repositories.prompt_repository import PromptRepository
from app.schemas.prompt import PromptCreate, PromptUpdate


class PromptService:
    """Service for prompt operations."""

    def __init__(self, session: AsyncSession):
        self.repository = PromptRepository(session)

    async def create_prompt(self, user: User, prompt_data: PromptCreate) -> Prompt:
        """Create a new prompt (Sellers only)."""
        if user.role != UserRole.seller:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only sellers can create prompts.",
            )

        prompt = Prompt(
            seller_id=user.id,
            category_id=prompt_data.category_id,
            title=prompt_data.title,
            short_description=prompt_data.short_description,
            full_description=prompt_data.full_description,
            price=prompt_data.price,
            cover_image_url=prompt_data.cover_image_url,
            prompt_file_url=prompt_data.prompt_file_url,
        )
        return await self.repository.create(prompt)

    async def get_prompt(self, prompt_id: uuid.UUID) -> Prompt:
        """Get a prompt by ID."""
        prompt = await self.repository.get_by_id(prompt_id)
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prompt not found.",
            )
        return prompt

    async def search_prompts(
        self,
        search_query: Optional[str] = None,
        category_id: Optional[uuid.UUID] = None,
        seller_id: Optional[uuid.UUID] = None,
        page: int = 1,
        limit: int = 12,
    ) -> Tuple[List[Prompt], int]:
        """Search prompts with pagination."""
        # Ensure page is at least 1, limit is reasonable
        page = max(1, page)
        limit = min(50, max(1, limit))
        
        return await self.repository.search(
            search_query=search_query,
            category_id=category_id,
            seller_id=seller_id,
            page=page,
            limit=limit,
        )
