"""Tests for prompt category display, prompt text visibility security, and delete functionality."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_prompt_category_and_security(client: AsyncClient):
    # 1. Fetch categories to verify strict { id, name } schema and pick a category_id
    cat_res = await client.get("/api/categories")
    assert cat_res.status_code == 200
    categories = cat_res.json()
    assert len(categories) > 0
    category = categories[0]
    # Check that category has EXACTLY id and name keys, ordered or minimal
    assert set(category.keys()) == {"id", "name"}
    category_id = category["id"]
    category_name = category["name"]

    # 2. Register and login a seller
    seller_data = {
        "name": "Security Test Seller",
        "email": "seller_sec_test@example.com",
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

    # 3. Create a prompt as seller
    prompt_create = {
        "title": "Secret AI Prompt Masterclass",
        "short_description": "An incredible prompt for generating top quality assets.",
        "full_description": "Detailed instructions on how to use this amazing secret prompt.",
        "category_id": category_id,
        "price": 29.99,
        "prompt_text": "ACT AS A MASTER AI CREATOR AND DO TOP SECRET WORK...",
    }
    create_res = await client.post("/api/prompts", json=prompt_create, headers=seller_headers)
    assert create_res.status_code in (200, 201)
    created_prompt = create_res.json()
    prompt_id = created_prompt["id"]

    # Verify category display right after creation has strictly { id, name }
    assert created_prompt["category"] is not None
    assert set(created_prompt["category"].keys()) == {"id", "name"}
    assert created_prompt["category"]["id"] == category_id
    assert created_prompt["category"]["name"] == category_name
    # Owner should see prompt_text on create
    assert created_prompt["prompt_text"] == prompt_create["prompt_text"]

    # 4. Public Marketplace Search (GET /api/prompts)
    search_res = await client.get("/api/prompts")
    assert search_res.status_code == 200
    search_data = search_res.json()
    found_item = next((item for item in search_data["items"] if item["id"] == prompt_id), None)
    assert found_item is not None
    # Category should strictly be { id, name }
    assert set(found_item["category"].keys()) == {"id", "name"}
    assert found_item["category"]["name"] == category_name
    # Prompt text MUST be null/None for public marketplace search
    assert found_item["prompt_text"] is None

    # 5. Public Product Detail (GET /api/prompts/{id}) without auth
    public_detail_res = await client.get(f"/api/prompts/{prompt_id}")
    assert public_detail_res.status_code == 200
    public_detail = public_detail_res.json()
    assert set(public_detail["category"].keys()) == {"id", "name"}
    assert public_detail["category"]["name"] == category_name
    # Prompt text MUST be null/None for anonymous access
    assert public_detail["prompt_text"] is None

    # 6. Register a buyer and test Product Detail & Delete Authorization
    buyer_data = {
        "name": "Security Test Buyer",
        "email": "buyer_sec_test@example.com",
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

    buyer_detail_res = await client.get(f"/api/prompts/{prompt_id}", headers=buyer_headers)
    assert buyer_detail_res.status_code == 200
    buyer_detail = buyer_detail_res.json()
    assert buyer_detail["category"]["name"] == category_name
    # Prompt text MUST be null/None for a buyer who has not purchased
    assert buyer_detail["prompt_text"] is None

    # Buyer attempts to DELETE listing -> must be forbidden (403)
    buyer_delete_res = await client.delete(f"/api/prompts/{prompt_id}", headers=buyer_headers)
    assert buyer_delete_res.status_code == 403

    # 7. Owner/Seller access to Product Detail (GET /api/prompts/{id})
    owner_detail_res = await client.get(f"/api/prompts/{prompt_id}", headers=seller_headers)
    assert owner_detail_res.status_code == 200
    owner_detail = owner_detail_res.json()
    assert owner_detail["category"]["name"] == category_name
    # Owner SHOULD see the prompt text
    assert owner_detail["prompt_text"] == prompt_create["prompt_text"]

    # 8. Seller access to My Prompts (GET /api/prompts/me)
    me_res = await client.get("/api/prompts/me", headers=seller_headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    me_item = next((item for item in me_data["items"] if item["id"] == prompt_id), None)
    assert me_item is not None
    assert me_item["category"]["name"] == category_name
    assert me_item["prompt_text"] == prompt_create["prompt_text"]

    # 9. Owner DELETES listing -> must return 204 No Content
    owner_delete_res = await client.delete(f"/api/prompts/{prompt_id}", headers=seller_headers)
    assert owner_delete_res.status_code == 204

    # Verify listing is removed everywhere
    # Detail returns 404
    after_delete_detail = await client.get(f"/api/prompts/{prompt_id}")
    assert after_delete_detail.status_code == 404

    # Marketplace search no longer includes prompt_id
    after_delete_search = await client.get("/api/prompts")
    assert after_delete_search.status_code == 200
    after_search_items = after_delete_search.json()["items"]
    assert not any(item["id"] == prompt_id for item in after_search_items)

    # My Prompts no longer includes prompt_id
    after_delete_me = await client.get("/api/prompts/me", headers=seller_headers)
    assert after_delete_me.status_code == 200
    after_me_items = after_delete_me.json()["items"]
    assert not any(item["id"] == prompt_id for item in after_me_items)
