"""API dependencies."""

from typing import AsyncGenerator

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import decode_token
from app.db.session import get_db_session
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.token import TokenPayload
from app.services.auth_service import AuthService

settings = get_settings()
security = HTTPBearer()


def get_user_repository(session: AsyncSession = Depends(get_db_session)) -> UserRepository:
    """Dependency to get UserRepository."""
    return UserRepository(session=session)


def get_auth_service(user_repo: UserRepository = Depends(get_user_repository)) -> AuthService:
    """Dependency to get AuthService."""
    return AuthService(user_repo=user_repo)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user_repo: UserRepository = Depends(get_user_repository),
) -> User:
    """Dependency to get the current authenticated user."""
    token = credentials.credentials
    try:
        payload = decode_token(token)
        token_data = TokenPayload(**payload)
        if token_data.type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type.",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await user_repo.get_by_id(token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
    user_repo: UserRepository = Depends(get_user_repository),
) -> User | None:
    """Dependency to optionally get the current authenticated user."""
    if not credentials:
        return None
        
    token = credentials.credentials
    try:
        payload = decode_token(token)
        token_data = TokenPayload(**payload)
        if token_data.type != "access":
            return None
    except Exception:
        return None

    return await user_repo.get_by_id(token_data.sub)


class RoleChecker:
    """Dependency class to check for required roles."""

    def __init__(self, allowed_roles: list[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)) -> User:
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted",
            )
        return user
