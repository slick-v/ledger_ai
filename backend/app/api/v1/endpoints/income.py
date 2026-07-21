from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.income import Income
from app.schemas.income import IncomeCreate, IncomeOut
from app.core.security import get_current_user

router = APIRouter()


@router.post("", response_model=IncomeOut)
def create_income(payload: IncomeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = payload.model_dump()
    data["category"] = data["category"].value
    data["account"] = data["account"].value
    income = Income(**data, user_id=current_user.id)
    db.add(income)
    db.commit()
    db.refresh(income)
    return income

@router.get("", response_model=list[IncomeOut])
def list_income(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Income).filter(Income.user_id == current_user.id).order_by(Income.date.desc()).all()


@router.get("/{income_id}", response_model=IncomeOut)
def get_income(income_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    return income


@router.put("/{income_id}", response_model=IncomeOut)
def update_income(income_id: int, payload: IncomeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    data = payload.model_dump()
    data["category"] = data["category"].value
    data["account"] = data["account"].value
    for field, value in data.items():
        setattr(income, field, value)
    db.commit()
    db.refresh(income)
    return income

@router.delete("/{income_id}", status_code=204)
def delete_income(income_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    db.delete(income)
    db.commit()