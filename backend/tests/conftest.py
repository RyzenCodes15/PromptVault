"""Test configuration and fixtures."""

import os
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# If running tests on the host machine against Docker Compose DB (`db:5432`), override to localhost:5433
if not os.path.exists("/.dockerenv") and "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = "postgresql+asyncpg://promptvault:promptvault@localhost:5433/promptvault"
elif not os.path.exists("/.dockerenv") and "@db:5432" in os.environ.get("DATABASE_URL", ""):
    os.environ["DATABASE_URL"] = os.environ["DATABASE_URL"].replace("@db:5432", "@localhost:5433")

from app.main import app
from app.db.session import engine

@pytest_asyncio.fixture(scope="session", autouse=True)
async def cleanup_engine():
    yield
    await engine.dispose()

@pytest_asyncio.fixture(scope="session")
async def client() -> AsyncClient:
    """Provide an async test client for the FastAPI app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
