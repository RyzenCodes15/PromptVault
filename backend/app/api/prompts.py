"""Prompts API router."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db_session
from app.models.user import User
from app.schemas.prompt import PromptCreate, PromptRead, PaginatedPromptRead
from app.services.prompt_service import PromptService


router = APIRouter()


@router.post("", response_model=PromptRead)
async def create_prompt(
    prompt_in: PromptCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """Create a new prompt (Sellers only)."""
    service = PromptService(session)
    return await service.create_prompt(current_user, prompt_in)


@router.get("", response_model=PaginatedPromptRead)
async def search_prompts(
    q: Optional[str] = Query(None, description="Search query"),
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by category ID"),
    seller_id: Optional[uuid.UUID] = Query(None, description="Filter by seller ID"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=50, description="Items per page"),
    session: AsyncSession = Depends(get_db_session),
):
    """Search and paginate prompts."""
    service = PromptService(session)
    items, total = await service.search_prompts(
        search_query=q,
        category_id=category_id,
        seller_id=seller_id,
        page=page,
        limit=limit,
    )
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.get("/{prompt_id}", response_model=PromptRead)
async def get_prompt(
    prompt_id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
):
    """Get a prompt by ID."""
    service = PromptService(session)
    return await service.get_prompt(prompt_id)
