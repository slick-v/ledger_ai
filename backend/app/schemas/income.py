from datetime import date as date_type
from decimal import Decimal

from pydantic import BaseModel

from app.models.income import IncomeCategory
from app.models.expense import AccountType


class IncomeCreate(BaseModel):
    amount: Decimal
    category: IncomeCategory
    account: AccountType
    notes: str | None = None
    date: date_type


class IncomeOut(IncomeCreate):
    id: int

    class Config:
        from_attributes = True