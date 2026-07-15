"""Tests for authentication endpoints."""

import uuid
import pytest
from httpx import AsyncClient

from app.models.user import User


@pytest.mark.asyncio
async def test_register_buyer(client: AsyncClient):
    """Test user registration."""
    email = f"buyer_{uuid.uuid4()}@example.com"
    response = await client.post(
        "/api/auth/register",
        json={
            "name": "Test Buyer",
            "email": email,
            "password": "securepassword123",
            "role": "buyer",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == email
    assert data["name"] == "Test Buyer"
    assert data["role"] == "buyer"
    assert "id" in data
    assert "password" not in data
    assert "hashed_password" not in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    """Test duplicate registration."""
    email = f"dup_{uuid.uuid4()}@example.com"
    user_data = {
        "name": "Dup User",
        "email": email,
        "password": "securepassword123",
    }
    await client.post("/api/auth/register", json=user_data)
    response = await client.post("/api/auth/register", json=user_data)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """Test successful login."""
    # Register first
    email = f"login_{uuid.uuid4()}@example.com"
    user_data = {
        "name": "Login User",
        "email": email,
        "password": "securepassword123",
    }
    await client.post("/api/auth/register", json=user_data)

    # Login
    response = await client.post(
        "/api/auth/login",
        json={"email": email, "password": "securepassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient):
    """Test login with invalid password."""
    # Register first
    email = f"invalid_{uuid.uuid4()}@example.com"
    user_data = {
        "name": "Invalid Login User",
        "email": email,
        "password": "securepassword123",
    }
    await client.post("/api/auth/register", json=user_data)

    # Login with bad pass
    response = await client.post(
        "/api/auth/login",
        json={"email": email, "password": "wrongpassword"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_protected_route_me(client: AsyncClient):
    """Test accessing a protected route."""
    # Register and login
    email = f"me_{uuid.uuid4()}@example.com"
    user_data = {
        "name": "Me User",
        "email": email,
        "password": "securepassword123",
    }
    await client.post("/api/auth/register", json=user_data)
    login_resp = await client.post(
        "/api/auth/login",
        json={"email": email, "password": "securepassword123"},
    )
    token = login_resp.json()["access_token"]

    # Access protected route
    response = await client.get(
        "/api/users/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == email


@pytest.mark.asyncio
async def test_protected_route_without_token(client: AsyncClient):
    """Test accessing a protected route without token."""
    response = await client.get("/api/users/me")
    assert response.status_code == 403  # HTTPBearer returns 403 when no auth is provided
