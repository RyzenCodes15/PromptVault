"""Authentication and user business logic."""

from typing import Tuple

from fastapi import HTTPException, status

from app.core.security import create_access_token, create_refresh_token, get_password_hash, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin


class AuthService:
    """Service for authentication and user management."""

    def __init__(self, user_repo: UserRepository) -> None:
        self.user_repo = user_repo

    async def register_user(self, user_in: UserCreate) -> User:
        """Register a new user."""
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists.",
            )

        hashed_password = get_password_hash(user_in.password)
        user = User(
            name=user_in.name,
            email=user_in.email,
            hashed_password=hashed_password,
            role=user_in.role,
            bio=user_in.bio,
            avatar_url=user_in.avatar_url,
        )
        return await self.user_repo.create(user)

    async def authenticate_user(self, user_in: UserLogin) -> Tuple[User, Token]:
        """Authenticate user and return tokens."""
        user = await self.user_repo.get_by_email(user_in.email)
        if not user or not verify_password(user_in.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = create_access_token(subject=str(user.id))
        refresh_token = create_refresh_token(subject=str(user.id))

        token = Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        )
        return user, token
