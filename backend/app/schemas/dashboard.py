from datetime import date as date_type
from decimal import Decimal

from pydantic import BaseModel


class TransactionOut(BaseModel):
    id: int
    type: str
    amount: Decimal
    category: str
    account: str
    merchant: str | None = None
    notes: str | None = None
    date: date_type

    class Config:
        from_attributes = True


class AccountBalanceOut(BaseModel):
    type: str
    balance: Decimal


class DashboardOut(BaseModel):
    balance: Decimal
    total_income: Decimal
    total_expenses: Decimal
    monthly_income: Decimal
    monthly_expenses: Decimal
    spent_today: Decimal
    daily_budget: Decimal
    accounts: list[AccountBalanceOut]
    recent_transactions: list[TransactionOut]