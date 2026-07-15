import asyncio
import httpx
import uuid

async def test_flow():
    email_buyer = f"buyer_{uuid.uuid4()}@example.com"
    email_seller = f"seller_{uuid.uuid4()}@example.com"
    
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        print("Registering and Logging in Buyer...")
        await client.post("/api/auth/register", json={"name": "Buyer", "email": email_buyer, "password": "securepassword", "role": "buyer"})
        login_buyer = await client.post("/api/auth/login", json={"email": email_buyer, "password": "securepassword"})
        token_buyer = login_buyer.json()["access_token"]
        
        me_buyer = await client.get("/api/users/me", headers={"Authorization": f"Bearer {token_buyer}"})
        print("Buyer /api/users/me:", me_buyer.status_code, me_buyer.text)
        
        print("\nRegistering and Logging in Seller...")
        await client.post("/api/auth/register", json={"name": "Seller", "email": email_seller, "password": "securepassword", "role": "seller"})
        login_seller = await client.post("/api/auth/login", json={"email": email_seller, "password": "securepassword"})
        token_seller = login_seller.json()["access_token"]
        
        me_seller = await client.get("/api/users/me", headers={"Authorization": f"Bearer {token_seller}"})
        print("Seller /api/users/me:", me_seller.status_code, me_seller.text)

if __name__ == "__main__":
    asyncio.run(test_flow())
