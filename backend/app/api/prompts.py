"""Prompts API router."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_optional_user
from app.core.config import get_settings
from app.db.session import get_db_session
from app.integrations.cloudinary import CloudinaryService
from app.models.user import User
from app.schemas.prompt import PromptCreate, PromptUpdate, PromptRead, PaginatedPromptRead
from app.services.prompt_service import PromptService
from app.services.order_service import OrderService

settings = get_settings()


router = APIRouter()


@router.post("", response_model=PromptRead, status_code=status.HTTP_201_CREATED)
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


@router.get("/me", response_model=PaginatedPromptRead)
async def get_my_prompts(
    q: Optional[str] = Query(None, description="Search query"),
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by category ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=50, description="Items per page"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """Get prompts for the authenticated seller."""
    service = PromptService(session)
    items, total = await service.get_seller_prompts(
        user=current_user,
        search_query=q,
        category_id=category_id,
        status_filter=status,
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
    current_user: User | None = Depends(get_optional_user),
):
    """Get a prompt by ID."""
    service = PromptService(session)
    return await service.get_prompt(prompt_id, current_user)


@router.get("/{prompt_id}/download")
async def download_prompt(
    prompt_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """Download prompt text file (must be owner or verified buyer)."""
    order_service = OrderService(session)
    content = await order_service.verify_download_access(current_user, prompt_id)

    prompt_service = PromptService(session)
    prompt = await prompt_service.repository.get_by_id(prompt_id)
    slug = "prompt"
    if prompt and prompt.title:
        slug = prompt.title.replace(" ", "_").replace("/", "_").lower()

    return Response(
        content=content,
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="{slug}_prompt.txt"'},
    )


@router.put("/{prompt_id}", response_model=PromptRead)
async def update_prompt(
    prompt_id: uuid.UUID,
    prompt_in: PromptUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """Update a prompt (Seller only)."""
    service = PromptService(session)
    return await service.update_prompt(prompt_id, current_user, prompt_in)


@router.delete("/{prompt_id}", status_code=204)
async def delete_prompt(
    prompt_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """Hard delete a prompt (Seller only)."""
    service = PromptService(session)
    await service.delete_prompt(prompt_id, current_user)


@router.post("/upload-image")
async def upload_prompt_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Upload a cover image for a prompt."""
    if current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can upload prompt images.")

    contents = await file.read()

    # Check if Cloudinary is properly configured
    cloud_name = settings.cloudinary_cloud_name
    api_key = settings.cloudinary_api_key
    api_secret = settings.cloudinary_api_secret

    has_cloudinary = (
        cloud_name
        and api_key
        and api_secret
        and not cloud_name.startswith("YOUR_")
        and not api_key.startswith("YOUR_")
        and not api_secret.startswith("YOUR_")
    )

    if has_cloudinary:
        # Use Cloudinary
        cloudinary_service = CloudinaryService(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
        )
        try:
            result = await cloudinary_service.upload_image(contents, folder="prompts")
            return {"url": result["secure_url"]}
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to upload image: {str(e)}"
            )
    else:
        # Local filesystem fallback (development)
        import uuid as _uuid
        from pathlib import Path

        uploads_dir = Path(__file__).resolve().parent.parent.parent / "uploads" / "prompts"
        uploads_dir.mkdir(parents=True, exist_ok=True)

        # Determine file extension
        ext = ".jpg"
        if file.content_type:
            ext_map = {
                "image/png": ".png",
                "image/jpeg": ".jpg",
                "image/webp": ".webp",
                "image/gif": ".gif",
            }
            ext = ext_map.get(file.content_type, ".jpg")

        filename = f"{_uuid.uuid4().hex}{ext}"
        file_path = uploads_dir / filename
        file_path.write_bytes(contents)

        # Return URL served by the backend
        backend_url = settings.backend_url.rstrip("/")
        return {"url": f"{backend_url}/api/uploads/prompts/{filename}"}

