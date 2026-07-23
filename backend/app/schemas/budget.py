from decimal import Decimal

from pydantic import BaseModel


class BudgetSet(BaseModel):
    category: str
    amount: Decimal


class BudgetStatus(BaseModel):
    category: str
    amount: Decimal        # monthly cap
    spent: Decimal         # spent this month in that category
    remaining: Decimal
    pct: int               # 0..100+ (can exceed 100 when over budget)
    over: bool


class BudgetSummary(BaseModel):
    total_budget: Decimal
    total_spent: Decimal
    total_remaining: Decimal
    pct: int
    over_count: int
    budgets: list[BudgetStatus]
