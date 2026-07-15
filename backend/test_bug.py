import asyncio
from app.db.session import async_session_factory
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate
from app.models.user import UserRole
import uuid
import os

async def main():
    os.environ["DATABASE_URL"] = "postgresql+asyncpg://promptvault:promptvault@localhost:5433/promptvault"
    async with async_session_factory() as session:
        user_repo = UserRepository(session)
        auth_service = AuthService(user_repo)
        
        email_buyer = f"buyer_{uuid.uuid4()}@example.com"
        email_seller = f"seller_{uuid.uuid4()}@example.com"
        
        print("Testing Seller")
        user_in_seller = UserCreate(name="Test Seller", email=email_seller, password="securepassword", role=UserRole.seller)
        try:
            seller = await auth_service.register_user(user_in_seller)
            print(f"Seller registered: {seller.email}")
        except Exception as e:
            print(f"Seller failed: {e}")
            import traceback
            traceback.print_exc()
            
        print("Testing Buyer")
        user_in_buyer = UserCreate(name="Test Buyer", email=email_buyer, password="securepassword", role=UserRole.buyer)
        try:
            buyer = await auth_service.register_user(user_in_buyer)
            print(f"Buyer registered: {buyer.email}")
        except Exception as e:
            print(f"Buyer failed: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
