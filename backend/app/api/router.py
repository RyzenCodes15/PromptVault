"""Top-level API router that aggregates all route modules."""

from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.health import router as health_router
from app.api.users import router as users_router
from app.api.categories import router as categories_router
from app.api.prompts import router as prompts_router
from app.api.uploads import router as uploads_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(categories_router, prefix="/categories", tags=["categories"])
api_router.include_router(prompts_router, prefix="/prompts", tags=["prompts"])
api_router.include_router(uploads_router, prefix="/uploads", tags=["uploads"])

