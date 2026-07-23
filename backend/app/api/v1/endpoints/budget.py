from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.budget import Budget
from app.models.expense import ExpenseCategory
from app.schemas.budget import BudgetSet, BudgetSummary
from app.services.budget_service import get_budget_summary
from app.core.security import get_current_user

router = APIRouter()

VALID_CATEGORIES = {c.value for c in ExpenseCategory}


@router.get("", response_model=BudgetSummary)
def list_budgets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_budget_summary(user_id=current_user.id, db=db)


@router.put("", status_code=204)
def set_budget(payload: BudgetSet, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")

    existing = (
        db.query(Budget)
        .filter(Budget.user_id == current_user.id, Budget.category == payload.category)
        .first()
    )

    # An amount of 0 (or less) clears the budget for that category.
    if payload.amount <= 0:
        if existing:
            db.delete(existing)
            db.commit()
        return

    if existing:
        existing.amount = payload.amount
    else:
        db.add(Budget(user_id=current_user.id, category=payload.category, amount=payload.amount))
    db.commit()


@router.delete("/{category}", status_code=204)
def delete_budget(category: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    budget = (
        db.query(Budget)
        .filter(Budget.user_id == current_user.id, Budget.category == category)
        .first()
    )
    if budget:
        db.delete(budget)
        db.commit()
