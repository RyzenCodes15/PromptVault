"""Tests for user profile editing and prompt listing editing workflows."""

import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_edit_profile_and_edit_listing_workflows(client: AsyncClient):
    uid = uuid.uuid4().hex[:8]
    # 1. Fetch categories to get valid category_id
    cat_res = await client.get("/api/categories")
    assert cat_res.status_code == 200
    category_id = cat_res.json()[0]["id"]

    # 2. Register seller and test profile update (PUT /api/users/me/profile)
    seller_data = {
        "name": f"Original Seller Name {uid}",
        "email": f"seller_edit_{uid}@example.com",
        "password": "Password123!",
        "role": "seller",
    }
    await client.post("/api/auth/register", json=seller_data)
    login_res = await client.post(
        "/api/auth/login",
        json={"email": seller_data["email"], "password": seller_data["password"]},
    )
    assert login_res.status_code == 200
    seller_token = login_res.json()["access_token"]
    seller_headers = {"Authorization": f"Bearer {seller_token}"}

    # Verify initial profile (GET /api/users/me)
    me_res = await client.get("/api/users/me", headers=seller_headers)
    assert me_res.status_code == 200
    assert me_res.json()["name"] == f"Original Seller Name {uid}"

    # Update seller profile via PUT /api/users/me/profile
    profile_update_data = {
        "name": "Updated Seller Name",
        "bio": "Expert prompt engineer with 5+ years of experience.",
    }
    update_profile_res = await client.put(
        "/api/users/me/profile", json=profile_update_data, headers=seller_headers
    )
    assert update_profile_res.status_code == 200
    updated_profile = update_profile_res.json()
    assert updated_profile["name"] == "Updated Seller Name"
    assert updated_profile["bio"] == "Expert prompt engineer with 5+ years of experience."

    # Verify persistence on GET /api/users/me
    me_after_update = await client.get("/api/users/me", headers=seller_headers)
    assert me_after_update.status_code == 200
    assert me_after_update.json()["name"] == "Updated Seller Name"
    assert me_after_update.json()["bio"] == "Expert prompt engineer with 5+ years of experience."

    # 3. Create a prompt listing as seller
    prompt_create = {
        "title": "Initial Prompt Title",
        "short_description": "Initial short description covering key capabilities.",
        "full_description": "Initial full description with comprehensive details.",
        "category_id": category_id,
        "price": 19.99,
        "prompt_text": "INITIAL PROMPT TEXT...",
    }
    create_res = await client.post("/api/prompts", json=prompt_create, headers=seller_headers)
    assert create_res.status_code in (200, 201)
    prompt_id = create_res.json()["id"]

    # 4. Edit prompt listing (PUT /api/prompts/{prompt_id})
    prompt_update = {
        "title": "Updated Prompt Title",
        "short_description": "Updated short description covering advanced capabilities.",
        "full_description": "Updated full description with comprehensive details.",
        "category_id": category_id,
        "price": 39.99,
        "prompt_text": "UPDATED PROMPT TEXT...",
        "status": "active",
    }
    update_prompt_res = await client.put(
        f"/api/prompts/{prompt_id}", json=prompt_update, headers=seller_headers
    )
    assert update_prompt_res.status_code == 200
    updated_listing = update_prompt_res.json()
    assert updated_listing["title"] == "Updated Prompt Title"
    assert updated_listing["price"] == 39.99
    assert updated_listing["prompt_text"] == "UPDATED PROMPT TEXT..."
    assert updated_listing["status"] == "active"

    # Verify marketplace search reflects updated listing
    search_res = await client.get("/api/prompts")
    assert search_res.status_code == 200
    found = next((p for p in search_res.json()["items"] if p["id"] == prompt_id), None)
    assert found is not None
    assert found["title"] == "Updated Prompt Title"
    assert found["price"] == 39.99

    # 5. Register buyer and test profile update
    buyer_data = {
        "name": f"Original Buyer Name {uid}",
        "email": f"buyer_edit_{uid}@example.com",
        "password": "Password123!",
        "role": "buyer",
    }
    await client.post("/api/auth/register", json=buyer_data)
    buyer_login = await client.post(
        "/api/auth/login",
        json={"email": buyer_data["email"], "password": buyer_data["password"]},
    )
    assert buyer_login.status_code == 200
    buyer_token = buyer_login.json()["access_token"]
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    buyer_update_res = await client.put(
        "/api/users/me/profile",
        json={"name": "Updated Buyer Name", "bio": "AI enthusiast and prompt collector."},
        headers=buyer_headers,
    )
    assert buyer_update_res.status_code == 200
    assert buyer_update_res.json()["name"] == "Updated Buyer Name"
    assert buyer_update_res.json()["bio"] == "AI enthusiast and prompt collector."
