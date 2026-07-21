from datetime import date as date_type
from decimal import Decimal

from pydantic import BaseModel

from app.models.expense import ExpenseCategory,AccountType


class ExpenseCreate(BaseModel):
    amount: Decimal
    category: ExpenseCategory
    account: AccountType
    merchant: str | None = None
    notes: str | None = None
    date: date_type


class ExpenseOut(ExpenseCreate):
    id: int

    class Config:
        from_attributes = True