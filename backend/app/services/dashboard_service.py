from datetime import date

from sqlalchemy import func as sql_func
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.models.income import Income
from app.schemas.dashboard import DashboardOut, TransactionOut


def get_dashboard_data(user_id: int, db: Session) -> DashboardOut:
    total_income = (
        db.query(sql_func.coalesce(sql_func.sum(Income.amount), 0))
        .filter(Income.user_id == user_id)
        .scalar()
    )

    total_expenses = (
        db.query(sql_func.coalesce(sql_func.sum(Expense.amount), 0))
        .filter(Expense.user_id == user_id)
        .scalar()
    )

    balance = total_income - total_expenses

    today = date.today()
    first_of_month = today.replace(day=1)

    monthly_income = (
        db.query(sql_func.coalesce(sql_func.sum(Income.amount), 0))
        .filter(Income.user_id == user_id, Income.date >= first_of_month)
        .scalar()
    )

    monthly_expenses = (
        db.query(sql_func.coalesce(sql_func.sum(Expense.amount), 0))
        .filter(Expense.user_id == user_id, Expense.date >= first_of_month)
        .scalar()
    )

    recent_expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .order_by(Expense.date.desc())
        .limit(5)
        .all()
    )

    recent_income = (
        db.query(Income)
        .filter(Income.user_id == user_id)
        .order_by(Income.date.desc())
        .limit(5)
        .all()
    )

    transactions = []
    for e in recent_expenses:
        transactions.append(TransactionOut(
            id=e.id,
            type="expense",
            amount=e.amount,
            category=e.category,
            account=e.account,
            merchant=e.merchant,
            notes=e.notes,
            date=e.date,
        ))
    for i in recent_income:
        transactions.append(TransactionOut(
            id=i.id,
            type="income",
            amount=i.amount,
            category=i.category,
            account=i.account,
            merchant=None,
            notes=i.notes,
            date=i.date,
        ))

    transactions.sort(key=lambda t: t.date, reverse=True)
    transactions = transactions[:10]

    return DashboardOut(
        balance=balance,
        total_income=total_income,
        total_expenses=total_expenses,
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        recent_transactions=transactions,
    )