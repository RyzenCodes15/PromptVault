"""FastAPI application factory."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func

from app.api.router import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.db.session import async_session_factory
from app.middleware.logging import RequestLoggingMiddleware
from app.models.category import Category


logger = logging.getLogger(__name__)

SEED_CATEGORIES = [
    {"name": "Image Generation", "slug": "image-generation"},
    {"name": "Writing", "slug": "writing"},
    {"name": "Coding", "slug": "coding"},
    {"name": "Marketing", "slug": "marketing"},
    {"name": "Productivity", "slug": "productivity"},
    {"name": "Education", "slug": "education"},
    {"name": "Business", "slug": "business"},
    {"name": "Design", "slug": "design"},
]


async def _seed_categories_if_empty() -> None:
    """Seed the categories table when it is empty."""
    async with async_session_factory() as session:
        count_result = await session.execute(
            select(func.count()).select_from(Category)
        )
        count = count_result.scalar_one()
        if count > 0:
            logger.info("Categories already seeded (%d found).", count)
            return

        logger.info("No categories found – seeding %d categories…", len(SEED_CATEGORIES))
        for cat_data in SEED_CATEGORIES:
            session.add(Category(**cat_data))
        await session.commit()
        logger.info("Category seed complete.")


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    """Application lifespan: seed data on startup."""
    await _seed_categories_if_empty()
    yield


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    # Configure structured logging
    logging.basicConfig(
        level=logging.DEBUG if settings.is_development else logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request logging
    app.add_middleware(RequestLoggingMiddleware)

    # Exception handlers
    register_exception_handlers(app)

    # Routes
    app.include_router(api_router)

    return app


app = create_app()
