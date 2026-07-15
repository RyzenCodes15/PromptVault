"""Categories API router."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.schemas.category import CategoryRead
from app.services.category_service import CategoryService


router = APIRouter()


@router.get("", response_model=List[CategoryRead])
async def get_categories(
    session: AsyncSession = Depends(get_db_session),
):
    """Retrieve all categories."""
    service = CategoryService(session)
    return await service.get_all_categories()
