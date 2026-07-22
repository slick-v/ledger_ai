"""rename enum labels to title-case to match app values

The enums were originally created with UPPERCASE member names as labels
(FOOD, GROCERY, ...), but the application inserts and reads the title-case
enum *values* ("Food", "Grocery", ...). This renames each label to its
title-case form. Renaming an enum label automatically updates every existing
row that uses it, so this also repairs previously stored data.

Revision ID: b7c1d2e3f4a5
Revises: fe68ad95c68f
Create Date: 2026-07-22

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'b7c1d2e3f4a5'
down_revision: Union[str, Sequence[str], None] = 'fe68ad95c68f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# enum type -> list of (old_label, new_label). Labels whose upper == title
# form (UPI, and same-cased values) are omitted since no rename is needed.
RENAMES: dict[str, list[tuple[str, str]]] = {
    "expensecategory": [
        ("FOOD", "Food"),
        ("GROCERY", "Grocery"),
        ("FUEL", "Fuel"),
        ("SHOPPING", "Shopping"),
        ("BILLS", "Bills"),
        ("HEALTH", "Health"),
        ("ENTERTAINMENT", "Entertainment"),
        ("TRAVEL", "Travel"),
        ("EDUCATION", "Education"),
        ("OTHER", "Other"),
    ],
    "accounttype": [
        ("CASH", "Cash"),
        ("BANK", "Bank"),
    ],
    "incomecategory": [
        ("SALARY", "Salary"),
        ("INVESTMENT", "Investment"),
        ("OTHER", "Other"),
    ],
}


def upgrade() -> None:
    for enum_name, pairs in RENAMES.items():
        for old, new in pairs:
            op.execute(
                f"ALTER TYPE {enum_name} RENAME VALUE '{old}' TO '{new}'"
            )


def downgrade() -> None:
    for enum_name, pairs in RENAMES.items():
        for old, new in pairs:
            op.execute(
                f"ALTER TYPE {enum_name} RENAME VALUE '{new}' TO '{old}'"
            )
