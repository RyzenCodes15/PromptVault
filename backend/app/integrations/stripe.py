"""Stripe integration service abstraction."""

import uuid
from typing import Any, Dict, Optional
import stripe
from fastapi import HTTPException, status


class StripeService:
    """Service for managing payments via Stripe."""

    def __init__(self, secret_key: str, webhook_secret: str) -> None:
        self._secret_key = secret_key
        self._webhook_secret = webhook_secret
        if self._secret_key and not self._is_mock_mode():
            stripe.api_key = self._secret_key

    def _is_mock_mode(self) -> bool:
        """Check if Stripe keys are placeholder/mock values."""
        return (
            not self._secret_key
            or self._secret_key.startswith("sk_test_YOUR_")
            or self._secret_key.startswith("YOUR_")
        )

    async def create_checkout_session(
        self,
        price_amount: int | float,
        currency: str = "inr",
        success_url: str = "",
        cancel_url: str = "",
        product_name: str = "Prompt Purchase",
        product_description: str = "",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Create a Stripe Checkout session for a one-time payment.

        Args:
            price_amount: Amount in cents/paise (int) or currency amount (if float).
            currency: ISO currency code.
            success_url: URL to redirect to after successful payment.
            cancel_url: URL to redirect to if the user cancels.
            product_name: Name of the prompt or product.
            product_description: Short description of the product.
            metadata: Custom metadata dictionary (e.g. order_id, prompt_id, buyer_id).

        Returns:
            Dictionary containing the checkout session details (id, url).
        """
        # Convert price to integer smallest units (e.g. paise/cents)
        if isinstance(price_amount, float):
            unit_amount = int(round(price_amount * 100))
        else:
            # If passed integer, assume it's already in paise/cents or check scale
            unit_amount = int(price_amount)

        if self._is_mock_mode():
            # Mock mode fallback when real Stripe API keys are not configured
            mock_session_id = f"cs_test_mock_{uuid.uuid4().hex}"
            redirect_url = success_url
            if "?" in redirect_url:
                redirect_url += f"&session_id={mock_session_id}"
            elif redirect_url:
                redirect_url += f"?session_id={mock_session_id}"
            else:
                redirect_url = f"/marketplace/orders/success?session_id={mock_session_id}"

            return {
                "id": mock_session_id,
                "url": redirect_url,
                "payment_status": "unpaid",
                "metadata": metadata or {},
            }

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": currency.lower(),
                            "product_data": {
                                "name": product_name,
                                "description": product_description[:250] if product_description else "",
                            },
                            "unit_amount": unit_amount,
                        },
                        "quantity": 1,
                    }
                ],
                mode="payment",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata=metadata or {},
            )
            return {
                "id": session.id,
                "url": session.url,
                "payment_status": session.payment_status,
                "metadata": session.metadata,
            }
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Stripe checkout error: {str(e)}",
            )

    async def verify_webhook(self, payload: bytes, signature: str) -> Dict[str, Any]:
        """Verify and parse a Stripe webhook event.

        Args:
            payload: Raw request body bytes.
            signature: Stripe-Signature header value.

        Returns:
            Parsed webhook event dictionary.
        """
        if self._is_mock_mode():
            # In mock mode, try to parse JSON payload directly
            import json
            try:
                data = json.loads(payload.decode("utf-8"))
                return data
            except Exception:
                return {}

        try:
            event = stripe.Webhook.construct_event(
                payload, signature, self._webhook_secret
            )
            return event
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payload",
            )
        except stripe.error.SignatureVerificationError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid signature",
            )
