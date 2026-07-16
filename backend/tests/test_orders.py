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
        # If real keys are configured in local .env, we manually trigger the verified webhook to complete it.
        if not session_id.startswith("cs_test_mock_"):
            import time
            import json
            import stripe
            from app.core.config import get_settings

            settings = get_settings()
            ts = int(time.time())
            payload_dict = {
                "id": f"evt_test_mock_{uuid.uuid4().hex[:8]}",
                "object": "event",
                "type": "checkout.session.completed",
                "data": {
                    "object": {
                        "id": session_id,
                        "object": "checkout.session",
                        "payment_intent": f"pi_test_intent_{uuid.uuid4().hex[:8]}",
                        "metadata": {"order_id": checkout_data["order_id"]},
                    }
                },
            }
            payload_bytes = json.dumps(payload_dict).encode("utf-8")
            webhook_secret = settings.stripe_webhook_secret or "whsec_test_secret"
            sig = stripe.WebhookSignature._compute_signature(f"{ts}.{payload_bytes.decode('utf-8')}", webhook_secret)
            valid_signature = f"t={ts},v1={sig}"

            webhook_resp = await ac.post(
                "/api/orders/webhook", content=payload_bytes, headers={"Stripe-Signature": valid_signature}
            )
            assert webhook_resp.status_code == 200

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


@pytest.mark.asyncio
async def test_real_stripe_checkout_and_webhook_verification(monkeypatch):
    """Test real Stripe checkout session creation (mock mode disabled) and ensure order status
    strictly remains pending until a cryptographically verified webhook arrives."""
    import json
    import time
    import stripe
    from app.core.config import get_settings
    from app.integrations.stripe import StripeService

    # Override Settings and StripeService to simulate real Stripe keys configured
    webhook_secret = "whsec_test_secret_for_verification"
    settings = get_settings()
    monkeypatch.setattr(settings, "stripe_webhook_secret", webhook_secret)
    monkeypatch.setattr(settings, "stripe_secret_key", "sk_test_mock_real_mode_key")
    monkeypatch.setattr(StripeService, "_is_mock_mode", lambda self: False)

    suffix = uuid.uuid4().hex[:8]
    unique_session_id = f"cs_test_real_{uuid.uuid4().hex}"

    # Mock stripe.checkout.Session.create_async so we don't make real network calls during pytest
    async def mock_create_async(**kwargs):
        return stripe.checkout.Session.construct_from(
            {
                "id": unique_session_id,
                "url": f"https://checkout.stripe.com/pay/{unique_session_id}",
                "payment_status": "unpaid",
                "metadata": kwargs.get("metadata", {}),
            },
            stripe.api_key or "sk_test_mock",
        )

    monkeypatch.setattr(stripe.checkout.Session, "create_async", mock_create_async)

    seller_email = f"seller_real_{suffix}@example.com"
    buyer_email = f"buyer_real_{suffix}@example.com"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register Seller & Create Prompt
        await ac.post(
            "/api/auth/register",
            json={"email": seller_email, "password": "Password123!", "name": "Seller Real", "role": "seller"},
        )
        seller_token = (await ac.post("/api/auth/login", json={"email": seller_email, "password": "Password123!"})).json()["access_token"]
        seller_headers = {"Authorization": f"Bearer {seller_token}"}

        category_id = (await ac.get("/api/categories")).json()[0]["id"]
        prompt_resp = await ac.post(
            "/api/prompts",
            headers=seller_headers,
            json={
                "title": "Real Stripe Prompt",
                "short_description": "Testing real stripe webhook flow.",
                "full_description": "Full description of real stripe prompt.",
                "category_id": category_id,
                "price": 799.0,
                "prompt_text": "UNLOCKED AFTER VERIFIED WEBHOOK ONLY",
            },
        )
        prompt_id = prompt_resp.json()["id"]

        # 2. Register Buyer
        await ac.post(
            "/api/auth/register",
            json={"email": buyer_email, "password": "Password123!", "name": "Buyer Real", "role": "buyer"},
        )
        buyer_token = (await ac.post("/api/auth/login", json={"email": buyer_email, "password": "Password123!"})).json()["access_token"]
        buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

        # 3. Buyer initiates checkout
        checkout_resp = await ac.post(
            "/api/orders/checkout", headers=buyer_headers, json={"prompt_id": prompt_id}
        )
        assert checkout_resp.status_code == 201
        checkout_data = checkout_resp.json()
        assert checkout_data["session_id"] == unique_session_id
        order_id = checkout_data["order_id"]

        # 4. Verify order is STILL PENDING right after checkout (no auto-completion without webhook)
        check_before = await ac.get(f"/api/orders/check-purchase/{prompt_id}", headers=buyer_headers)
        assert check_before.json() == {"is_purchased": False, "is_owner": False}

        get_prompt_before = await ac.get(f"/api/prompts/{prompt_id}", headers=buyer_headers)
        assert get_prompt_before.json()["prompt_text"] is None
        assert get_prompt_before.json()["is_purchased"] is False

        unauth_dl_before = await ac.get(f"/api/prompts/{prompt_id}/download", headers=buyer_headers)
        assert unauth_dl_before.status_code == 403

        # 5. Construct webhook payload
        ts = int(time.time())
        payload_dict = {
            "id": f"evt_test_real_{suffix}",
            "object": "event",
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": unique_session_id,
                    "object": "checkout.session",
                    "payment_intent": f"pi_test_intent_{suffix}",
                    "metadata": {"order_id": order_id},
                }
            },
        }
        payload_bytes = json.dumps(payload_dict).encode("utf-8")

        # Test sending with missing signature header -> 400 Bad Request
        missing_sig_resp = await ac.post("/api/orders/webhook", content=payload_bytes)
        assert missing_sig_resp.status_code == 400
        assert "Missing Stripe-Signature header" in missing_sig_resp.text

        # Test sending with invalid signature -> 400 Bad Request
        invalid_sig_resp = await ac.post(
            "/api/orders/webhook", content=payload_bytes, headers={"Stripe-Signature": "t=123,v1=invalid_signature"}
        )
        assert invalid_sig_resp.status_code == 400
        assert "Invalid signature" in invalid_sig_resp.text

        # Verify order is STILL locked
        assert (await ac.get(f"/api/orders/check-purchase/{prompt_id}", headers=buyer_headers)).json()["is_purchased"] is False

        # Compute valid signature
        sig = stripe.WebhookSignature._compute_signature(f"{ts}.{payload_bytes.decode('utf-8')}", webhook_secret)
        valid_signature = f"t={ts},v1={sig}"

        # 6. Send verified webhook
        valid_resp = await ac.post(
            "/api/orders/webhook", content=payload_bytes, headers={"Stripe-Signature": valid_signature}
        )
        assert valid_resp.status_code == 200
        assert valid_resp.json() == {"status": "success"}

        # 7. Verify prompt is now UNLOCKED and downloadable
        get_prompt_after = await ac.get(f"/api/prompts/{prompt_id}", headers=buyer_headers)
        assert get_prompt_after.json()["is_purchased"] is True
        assert get_prompt_after.json()["prompt_text"] == "UNLOCKED AFTER VERIFIED WEBHOOK ONLY"

        buyer_dl_after = await ac.get(f"/api/prompts/{prompt_id}/download", headers=buyer_headers)
        assert buyer_dl_after.status_code == 200
        assert buyer_dl_after.text == "UNLOCKED AFTER VERIFIED WEBHOOK ONLY"
