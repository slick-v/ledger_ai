from datetime import date as date_type
from decimal import Decimal

from pydantic import BaseModel

from app.models.income import IncomeCategory


class IncomeCreate(BaseModel):
    amount: Decimal
    category: IncomeCategory
    account: str
    notes: str | None = None
    date: date_type


class IncomeOut(IncomeCreate):
    id: int

    class Config:
        from_attributes = True