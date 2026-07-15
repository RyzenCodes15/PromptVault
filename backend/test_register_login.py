import asyncio
import httpx
import uuid

async def test_flow():
    email_buyer = f"buyer_{uuid.uuid4()}@example.com"
    email_seller = f"seller_{uuid.uuid4()}@example.com"
    
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        print(f"Testing Buyer: {email_buyer}")
        res_buyer = await client.post("/api/auth/register", json={
            "name": "Buyer Test",
            "email": email_buyer,
            "password": "securepassword",
            "role": "buyer"
        })
        print("Buyer Register:", res_buyer.status_code, res_buyer.text)
        
        login_buyer = await client.post("/api/auth/login", json={
            "email": email_buyer,
            "password": "securepassword"
        })
        print("Buyer Login:", login_buyer.status_code, login_buyer.text)
        
        print(f"\nTesting Seller: {email_seller}")
        res_seller = await client.post("/api/auth/register", json={
            "name": "Seller Test",
            "email": email_seller,
            "password": "securepassword",
            "role": "seller"
        })
        print("Seller Register:", res_seller.status_code, res_seller.text)
        
        login_seller = await client.post("/api/auth/login", json={
            "email": email_seller,
            "password": "securepassword"
        })
        print("Seller Login:", login_seller.status_code, login_seller.text)

if __name__ == "__main__":
    asyncio.run(test_flow())
