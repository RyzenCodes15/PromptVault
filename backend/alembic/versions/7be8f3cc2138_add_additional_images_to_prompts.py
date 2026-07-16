"""add additional_images to prompts

Revision ID: 7be8f3cc2138
Revises: ca408cb52f00
Create Date: 2026-07-16 10:06:32.175372
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op



# revision identifiers, used by Alembic.
revision: str = '7be8f3cc2138'
down_revision: Union[str, None] = 'ca408cb52f00'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade database schema."""
    op.add_column('prompts', sa.Column('additional_images', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade database schema."""
    op.drop_column('prompts', 'additional_images')
