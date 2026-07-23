"""add email_notifications to users

Revision ID: d9e1f2a3b4c5
Revises: c8d2e3f4a5b6
Create Date: 2026-07-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd9e1f2a3b4c5'
down_revision: Union[str, Sequence[str], None] = 'c8d2e3f4a5b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column('email_notifications', sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    op.drop_column('users', 'email_notifications')
