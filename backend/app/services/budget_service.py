from datetime import date
from decimal import Decimal

from sqlalchemy import func as sql_func
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.expense import Expense
from app.schemas.budget import BudgetStatus, BudgetSummary


def get_budget_summary(user_id: int, db: Session) -> BudgetSummary:
    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == user_id)
        .order_by(Budget.category)
        .all()
    )

    # Amount spent per category for the current month
    first_of_month = date.today().replace(day=1)
    spent_rows = (
        db.query(Expense.category, sql_func.coalesce(sql_func.sum(Expense.amount), 0))
        .filter(Expense.user_id == user_id, Expense.date >= first_of_month)
        .group_by(Expense.category)
        .all()
    )
    spent_map = {cat: Decimal(amt) for cat, amt in spent_rows}

    statuses: list[BudgetStatus] = []
    total_budget = Decimal(0)
    total_spent = Decimal(0)
    over_count = 0

    for b in budgets:
        cap = Decimal(b.amount)
        spent = spent_map.get(b.category, Decimal(0))
        remaining = cap - spent
        pct = int((spent / cap * 100).to_integral_value()) if cap > 0 else 0
        over = spent > cap

        statuses.append(
            BudgetStatus(
                category=b.category,
                amount=cap,
                spent=spent,
                remaining=remaining,
                pct=pct,
                over=over,
            )
        )
        total_budget += cap
        total_spent += spent
        if over:
            over_count += 1

    total_pct = int((total_spent / total_budget * 100).to_integral_value()) if total_budget > 0 else 0

    return BudgetSummary(
        total_budget=total_budget,
        total_spent=total_spent,
        total_remaining=total_budget - total_spent,
        pct=total_pct,
        over_count=over_count,
        budgets=statuses,
    )
