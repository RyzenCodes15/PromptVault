"""Prompt service layer."""

import uuid
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.prompt import Prompt
from app.models.user import User, UserRole
from app.repositories.order_repository import OrderRepository
from app.repositories.prompt_repository import PromptRepository
from app.schemas.prompt import PromptCreate, PromptRead, PromptUpdate


class PromptService:
    """Service for prompt operations."""

    def __init__(self, session: AsyncSession):
        self.session = session
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
            additional_images=prompt_data.additional_images or [],
            prompt_text=prompt_data.prompt_text,
        )
        return await self.repository.create(prompt)

    async def get_prompt(self, prompt_id: uuid.UUID, user: Optional[User] = None) -> Prompt | PromptRead:
        """Get a prompt by ID. Redacts prompt_text if user is not the seller or a verified buyer."""
        prompt = await self.repository.get_by_id(prompt_id)
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prompt not found.",
            )

        prompt_read = PromptRead.model_validate(prompt)

        # Check if user is seller/owner
        if user and prompt.seller_id == user.id:
            prompt_read.is_owner = True
            prompt_read.is_purchased = True
            return prompt_read

        # Check if user has purchased this prompt
        if user and user.role == UserRole.buyer:
            order_repo = OrderRepository(self.session)
            has_purchased = await order_repo.has_purchased_prompt(user.id, prompt_id)
            if has_purchased:
                prompt_read.is_purchased = True
                return prompt_read

        # Otherwise redact prompt_text
        prompt_read.prompt_text = None
        return prompt_read

    async def search_prompts(
        self,
        search_query: Optional[str] = None,
        category_id: Optional[uuid.UUID] = None,
        seller_id: Optional[uuid.UUID] = None,
        page: int = 1,
        limit: int = 12,
    ) -> Tuple[List[PromptRead], int]:
        """Search prompts with pagination."""
        # Ensure page is at least 1, limit is reasonable
        page = max(1, page)
        limit = min(50, max(1, limit))
        
        prompts, total = await self.repository.search(
            search_query=search_query,
            category_id=category_id,
            seller_id=seller_id,
            page=page,
            limit=limit,
        )
        
        # Always redact prompt_text in public search results using PromptRead models
        prompt_reads = []
        for prompt in prompts:
            pr = PromptRead.model_validate(prompt)
            pr.prompt_text = None
            prompt_reads.append(pr)
            
        return prompt_reads, total

    async def get_seller_prompts(
        self,
        user: User,
        search_query: Optional[str] = None,
        category_id: Optional[uuid.UUID] = None,
        status_filter: Optional[str] = None,
        page: int = 1,
        limit: int = 12,
    ) -> Tuple[List[Prompt], int]:
        """Get prompts for a seller."""
        if user.role != UserRole.seller:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only sellers can access this endpoint.",
            )
            
        page = max(1, page)
        limit = min(50, max(1, limit))
        
        return await self.repository.get_seller_prompts(
            seller_id=user.id,
            search_query=search_query,
            category_id=category_id,
            status=status_filter,
            page=page,
            limit=limit,
        )

    async def update_prompt(
        self, prompt_id: uuid.UUID, user: User, prompt_in: PromptUpdate
    ) -> Prompt:
        """Update a prompt (must be owner)."""
        prompt = await self.repository.get_by_id(prompt_id)
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prompt not found.",
            )
            
        if prompt.seller_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions.",
            )

        update_data = prompt_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(prompt, field, value)

        return await self.repository.update(prompt)

    async def delete_prompt(self, prompt_id: uuid.UUID, user: User) -> None:
        """Hard delete a prompt (must be owner)."""
        prompt = await self.repository.get_by_id(prompt_id)
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prompt not found.",
            )
            
        if prompt.seller_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions.",
            )

        await self.repository.delete(prompt)
