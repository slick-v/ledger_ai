from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func as sql_func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.expense import Expense
from app.models.income import Income
from app.core.config import settings
from app.core.security import get_current_user

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.email not in settings.admin_email_list:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/stats")
def admin_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_users = db.query(sql_func.count(User.id)).scalar()
    total_expenses = db.query(sql_func.count(Expense.id)).scalar()
    total_income = db.query(sql_func.count(Income.id)).scalar()

    recent_users = (
        db.query(User.id, User.email, User.created_at)
        .order_by(User.created_at.desc())
        .limit(20)
        .all()
    )

    return {
        "total_users": total_users,
        "total_expenses": total_expenses,
        "total_income_entries": total_income,
        "recent_users": [
            {"id": u.id, "email": u.email, "created_at": str(u.created_at)}
            for u in recent_users
        ],
    }


@router.get("/users")
def list_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()

    result = []
    for user in users:
        expense_count = db.query(sql_func.count(Expense.id)).filter(Expense.user_id == user.id).scalar()
        income_count = db.query(sql_func.count(Income.id)).filter(Income.user_id == user.id).scalar()
        expense_total = (
            db.query(sql_func.coalesce(sql_func.sum(Expense.amount), 0))
            .filter(Expense.user_id == user.id)
            .scalar()
        )

        result.append({
            "id": user.id,
            "email": user.email,
            "created_at": str(user.created_at),
            "expense_count": expense_count,
            "income_count": income_count,
            "total_spent": float(expense_total),
        })

    return {"users": result}


