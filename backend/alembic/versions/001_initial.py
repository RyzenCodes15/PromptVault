"""Initial migration — empty baseline.

Revision ID: 001_initial
Revises:
Create Date: 2025-01-01 00:00:00.000000
"""

from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade database schema — baseline, no tables yet."""
    pass


def downgrade() -> None:
    """Downgrade database schema — baseline, nothing to remove."""
    pass
