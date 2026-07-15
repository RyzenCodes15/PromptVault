"""User endpoints."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app.api.deps import get_current_user, get_user_repository
from app.core.config import get_settings
from app.integrations.cloudinary import CloudinaryService
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserRead, UserUpdate

router = APIRouter()
settings = get_settings()


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)) -> Any:
    """Get the current authenticated user's profile."""
    return current_user


@router.put("/me/profile", response_model=UserRead)
async def update_profile(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    user_repo: UserRepository = Depends(get_user_repository),
) -> Any:
    """Update current user profile."""
    if user_in.name is not None:
        current_user.name = user_in.name
    if user_in.bio is not None:
        current_user.bio = user_in.bio

    return await user_repo.update(current_user)


@router.post("/me/avatar", response_model=UserRead)
async def upload_avatar(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    user_repo: UserRepository = Depends(get_user_repository),
) -> Any:
    """Upload an avatar image to Cloudinary and update the user profile."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image",
        )

    cloudinary_service = CloudinaryService(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
    )

    contents = await file.read()
    try:
        result = await cloudinary_service.upload_image(contents, folder="avatars")
        current_user.avatar_url = result.get("secure_url")
        return await user_repo.update(current_user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}",
        )


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_me(
    current_user: User = Depends(get_current_user),
    user_repo: UserRepository = Depends(get_user_repository),
) -> None:
    """Delete the current user's account."""
    await user_repo.delete(current_user)
