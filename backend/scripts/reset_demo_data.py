"""Script to reset development database and wipe marketplace transaction/prompt data while preserving users, categories, and settings."""

import asyncio
import shutil
import sys
from pathlib import Path

# Add the project root to the Python path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session_factory
from app.models.category import Category
from app.models.order import Order, OrderItem, Payment
from app.models.prompt import Prompt
from app.models.user import User


async def reset_demo_data() -> None:
    """Wipe prompts, orders, order items, payments, and uploaded files."""
    print("Starting development data reset...")

    async with async_session_factory() as session:
        print("Removing order items...")
        await session.execute(delete(OrderItem))

        print("Removing payments...")
        await session.execute(delete(Payment))

        print("Removing orders...")
        await session.execute(delete(Order))

        print("Removing prompts...")
        await session.execute(delete(Prompt))

        await session.commit()

        # Verify counts
        prompt_count = (await session.execute(select(func.count(Prompt.id)))).scalar()
        order_count = (await session.execute(select(func.count(Order.id)))).scalar()
        item_count = (await session.execute(select(func.count(OrderItem.id)))).scalar()
        payment_count = (await session.execute(select(func.count(Payment.id)))).scalar()
        user_count = (await session.execute(select(func.count(User.id)))).scalar()
        category_count = (await session.execute(select(func.count(Category.id)))).scalar()

        print("\n--- Database Verification Counts ---")
        print(f"Prompts: {prompt_count}")
        print(f"Orders: {order_count}")
        print(f"Order Items: {item_count}")
        print(f"Payments: {payment_count}")
        print(f"Users (preserved): {user_count}")
        print(f"Categories (preserved): {category_count}")

    # Wipe uploaded files
    uploads_dir = Path(__file__).resolve().parent.parent / "uploads" / "prompts"
    if uploads_dir.exists():
        print(f"\nCleaning upload directory: {uploads_dir}")
        for file_path in uploads_dir.iterdir():
            if file_path.is_file() and file_path.name != ".gitkeep":
                file_path.unlink()
                print(f"  Removed file: {file_path.name}")
    else:
        uploads_dir.mkdir(parents=True, exist_ok=True)
        print(f"\nCreated upload directory: {uploads_dir}")

    print("\nDevelopment data reset complete.")


if __name__ == "__main__":
    asyncio.run(reset_demo_data())
