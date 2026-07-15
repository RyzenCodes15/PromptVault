"""Authentication endpoints."""

from typing import Any

from fastapi import APIRouter, Depends

from app.api.deps import get_auth_service
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin, UserRead
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=201)
async def register(
    user_in: UserCreate, auth_service: AuthService = Depends(get_auth_service)
) -> Any:
    """Register a new user."""
    print(f"Registering: {user_in.email}"); return await auth_service.register_user(user_in)


@router.post("/login", response_model=Token)
async def login(
    user_in: UserLogin, auth_service: AuthService = Depends(get_auth_service)
) -> Any:
    """Authenticate and get access token."""
    _, token = await auth_service.authenticate_user(user_in)
    return token
