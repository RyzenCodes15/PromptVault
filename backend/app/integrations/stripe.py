"""Stripe integration service abstraction.

This module defines the interface for Stripe payment processing.
Implementation will be added when payment functionality is built.
"""


class StripeService:
    """Service for managing payments and subscriptions via Stripe."""

    def __init__(self, secret_key: str, webhook_secret: str) -> None:
        self._secret_key = secret_key
        self._webhook_secret = webhook_secret

    async def create_checkout_session(
        self,
        price_amount: int,
        currency: str = "usd",
        success_url: str = "",
        cancel_url: str = "",
    ) -> dict:
        """Create a Stripe Checkout session for a one-time payment.

        Args:
            price_amount: Amount in cents.
            currency: ISO currency code.
            success_url: URL to redirect to after successful payment.
            cancel_url: URL to redirect to if the user cancels.

        Returns:
            Dictionary containing the checkout session details.
        """
        raise NotImplementedError("Stripe integration not yet configured")

    async def verify_webhook(self, payload: bytes, signature: str) -> dict:
        """Verify and parse a Stripe webhook event.

        Args:
            payload: Raw request body bytes.
            signature: Stripe-Signature header value.

        Returns:
            Parsed webhook event dictionary.
        """
        raise NotImplementedError("Stripe integration not yet configured")

    async def create_customer(self, email: str, name: str = "") -> dict:
        """Create a Stripe customer record.

        Args:
            email: Customer email address.
            name: Customer display name.

        Returns:
            Dictionary containing the created customer details.
        """
        raise NotImplementedError("Stripe integration not yet configured")
