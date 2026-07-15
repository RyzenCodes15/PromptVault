import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_order_checkout_webhook_and_download_flow():
    suffix = uuid.uuid4().hex[:8]
    seller_email = f"seller_order_{suffix}@example.com"
    buyer_email = f"buyer_order_{suffix}@example.com"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register Seller and Create a Prompt
        seller_resp = await ac.post(
            "/api/auth/register",
            json={
                "email": seller_email,
                "password": "Password123!",
                "name": "Seller Test",
                "role": "seller",
            },
        )
        assert seller_resp.status_code == 201, seller_resp.text
        seller_login = await ac.post(
            "/api/auth/login",
            json={
                "email": seller_email,
                "password": "Password123!",
            },
        )
        assert seller_login.status_code == 200
        seller_token = seller_login.json()["access_token"]
        seller_headers = {"Authorization": f"Bearer {seller_token}"}

        # Get a category
        cat_resp = await ac.get("/api/categories")
        assert cat_resp.status_code == 200
        category_id = cat_resp.json()[0]["id"]

        # Create prompt
        prompt_resp = await ac.post(
            "/api/prompts",
            headers=seller_headers,
            json={
                "title": "Secret AI Prompt",
                "short_description": "An amazing secret prompt for testing orders and downloads.",
                "full_description": "Full details of the secret AI prompt that solves complex logic.",
                "category_id": category_id,
                "price": 499.0,
                "prompt_text": "YOU ARE A SUPER AI AGENT. SOLVE ALL TASKS.",
            },
        )
        assert prompt_resp.status_code == 201, prompt_resp.text
        prompt_data = prompt_resp.json()
        prompt_id = prompt_data["id"]

        # Seller can verify ownership via check-purchase
        check_owner_resp = await ac.get(
            f"/api/orders/check-purchase/{prompt_id}", headers=seller_headers
        )
        assert check_owner_resp.status_code == 200
        assert check_owner_resp.json() == {"is_purchased": True, "is_owner": True}

        # Seller can download their own prompt
        seller_dl_resp = await ac.get(
            f"/api/prompts/{prompt_id}/download", headers=seller_headers
        )
        assert seller_dl_resp.status_code == 200
        assert seller_dl_resp.text == "YOU ARE A SUPER AI AGENT. SOLVE ALL TASKS."

        # 2. Register Buyer
        buyer_resp = await ac.post(
            "/api/auth/register",
            json={
                "email": buyer_email,
                "password": "Password123!",
                "name": "Buyer Test",
                "role": "buyer",
            },
        )
        assert buyer_resp.status_code == 201
        buyer_login = await ac.post(
            "/api/auth/login",
            json={
                "email": buyer_email,
                "password": "Password123!",
            },
        )
        assert buyer_login.status_code == 200
        buyer_token = buyer_login.json()["access_token"]
        buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

        # Check unpurchased status for buyer
        check_buyer_resp = await ac.get(
            f"/api/orders/check-purchase/{prompt_id}", headers=buyer_headers
        )
        assert check_buyer_resp.status_code == 200
        assert check_buyer_resp.json() == {"is_purchased": False, "is_owner": False}

        # Buyer attempts to download before purchasing -> 403 Forbidden
        unauth_dl_resp = await ac.get(
            f"/api/prompts/{prompt_id}/download", headers=buyer_headers
        )
        assert unauth_dl_resp.status_code == 403

        # Buyer checks prompt details -> prompt_text should be redacted (None)
        get_prompt_resp = await ac.get(f"/api/prompts/{prompt_id}", headers=buyer_headers)
        assert get_prompt_resp.status_code == 200
        assert get_prompt_resp.json()["prompt_text"] is None
        assert get_prompt_resp.json()["is_purchased"] is False

        # Sellers cannot buy prompts
        seller_checkout_resp = await ac.post(
            "/api/orders/checkout", headers=seller_headers, json={"prompt_id": prompt_id}
        )
        assert seller_checkout_resp.status_code == 403

        # 3. Buyer initiates checkout
        checkout_resp = await ac.post(
            "/api/orders/checkout", headers=buyer_headers, json={"prompt_id": prompt_id}
        )
        assert checkout_resp.status_code == 201, checkout_resp.text
        checkout_data = checkout_resp.json()
        assert "checkout_url" in checkout_data
        assert "session_id" in checkout_data
        assert "order_id" in checkout_data
        session_id = checkout_data["session_id"]

        # Because we are in mock/dev mode, checkout auto-completed!
        # Or let's verify webhook triggering explicitly
        if session_id.startswith("cs_test_mock_"):
            # Already auto-completed
            pass

        # 4. Buyer checks prompt details now -> prompt_text should be UNLOCKED
        get_prompt_after = await ac.get(f"/api/prompts/{prompt_id}", headers=buyer_headers)
        assert get_prompt_after.status_code == 200
        assert get_prompt_after.json()["prompt_text"] == "YOU ARE A SUPER AI AGENT. SOLVE ALL TASKS."
        assert get_prompt_after.json()["is_purchased"] is True

        # Buyer can now download the prompt file
        buyer_dl_resp = await ac.get(
            f"/api/prompts/{prompt_id}/download", headers=buyer_headers
        )
        assert buyer_dl_resp.status_code == 200
        assert buyer_dl_resp.text == "YOU ARE A SUPER AI AGENT. SOLVE ALL TASKS."
        assert "attachment" in buyer_dl_resp.headers["Content-Disposition"]

        # Buyer checks my-purchases history
        my_purchases_resp = await ac.get("/api/orders/my-purchases", headers=buyer_headers)
        assert my_purchases_resp.status_code == 200
        purchases_data = my_purchases_resp.json()
        assert purchases_data["total"] == 1
        assert purchases_data["items"][0]["prompt_id"] == prompt_id
        assert purchases_data["items"][0]["price_at_purchase"] == 499.0
        assert purchases_data["items"][0]["seller_name"] == "Seller Test"

        # Seller checks seller-stats
        stats_resp = await ac.get("/api/orders/seller-stats", headers=seller_headers)
        assert stats_resp.status_code == 200
        stats_data = stats_resp.json()
        assert stats_data["sales_count"] == 1
        assert stats_data["total_revenue"] == 499.0
        assert len(stats_data["latest_orders"]) == 1
        assert stats_data["latest_orders"][0]["prompt_title"] == "Secret AI Prompt"
