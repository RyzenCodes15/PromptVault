"""Health check endpoint."""

from datetime import datetime, timezone

from fastapi import APIRouter
from sqlalchemy import text

from app.db.session import async_session_factory

router = APIRouter()


@router.get("/health")
async def health_check() -> dict:
    """Return application and database health status."""
    db_status = "disconnected"

    try:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
            db_status = "connected"
    except Exception:
        db_status = "disconnected"

    status = "healthy" if db_status == "connected" else "degraded"

    return {
        "status": status,
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
