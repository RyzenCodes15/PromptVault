"""Seed script for marketplace categories."""

import asyncio
import sys
import os
from pathlib import Path

# Add the project root to the Python path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import engine, async_session_factory
from app.models.category import Category


CATEGORIES = [
    {"name": "Image Generation", "slug": "image-generation"},
    {"name": "Writing", "slug": "writing"},
    {"name": "Coding", "slug": "coding"},
    {"name": "Marketing", "slug": "marketing"},
    {"name": "Productivity", "slug": "productivity"},
    {"name": "Education", "slug": "education"},
    {"name": "Business", "slug": "business"},
    {"name": "Design", "slug": "design"},
]


async def seed_categories() -> None:
    """Seed the database with initial categories."""
    print("Starting category seed...")
    
    async with async_session_factory() as session:
        for category_data in CATEGORIES:
            # Check if category already exists
            stmt = select(Category).where(Category.slug == category_data["slug"])
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if not existing:
                print(f"Creating category: {category_data['name']}")
                category = Category(**category_data)
                session.add(category)
            else:
                print(f"Category already exists: {category_data['name']}")
                
        await session.commit()
        print("Category seed complete.")


if __name__ == "__main__":
    asyncio.run(seed_categories())
