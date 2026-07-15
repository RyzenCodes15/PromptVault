import asyncio
import httpx
import uuid

async def test_flow():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        email_buyer = f"buyer_{uuid.uuid4()}@example.com"
        print(f"Testing Buyer: {email_buyer}")
        res_buyer = await client.post("/api/auth/register", json={
            "name": "Buyer Test",
            "email": email_buyer,
            "password": "securepassword",
            "role": "buyer"
        })
        print("Buyer Register:", res_buyer.status_code, res_buyer.text)
        
        email_seller = f"seller_{uuid.uuid4()}@example.com"
        print(f"\nTesting Seller: {email_seller}")
        res_seller = await client.post("/api/auth/register", json={
            "name": "Seller Test",
            "email": email_seller,
            "password": "securepassword",
            "role": "seller"
        })
        print("Seller Register:", res_seller.status_code, res_seller.text)

asyncio.run(test_flow())
