from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from config import settings
from db import test_connection, get_db
from models import User, Expense, Income
from schemas import UserCreate, UserOut, Token, ExpenseCreate, ExpenseOut, IncomeCreate, IncomeOut
from security import hash_password, verify_password, create_access_token, get_current_user
from typing import List

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello from the expense tracker backend", "env": settings.ENVIRONMENT}

@app.get("/db-check")
def db_check():
    return {"db_result": test_connection()}

@app.post("/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/login", response_model=Token)
def login(payload: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user_id=user.id)
    return Token(access_token=token)

@app.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


# ---- Expenses ----

@app.post("/expenses", response_model=ExpenseOut)
def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = Expense(**payload.model_dump(), user_id=current_user.id)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@app.get("/expenses", response_model=List[ExpenseOut])
def list_expenses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Expense).filter(Expense.user_id == current_user.id).order_by(Expense.date.desc()).all()

@app.get("/expenses/{expense_id}", response_model=ExpenseOut)
def get_expense(expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense



# @app.get("/expense/{income}")
@app.put("/expenses/{expense_id}", response_model=ExpenseOut)
def update_expense(expense_id: int, payload: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    for field, value in payload.model_dump().items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)
    return expense

@app.delete("/expenses/{expense_id}", status_code=204)
def delete_expense(expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()


# ---- Income ----

@app.post("/income", response_model=IncomeOut)
def create_income(payload: IncomeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    income = Income(**payload.model_dump(), user_id=current_user.id)
    db.add(income)
    db.commit()
    db.refresh(income)
    return income

@app.get("/income", response_model=List[IncomeOut])
def list_income(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Income).filter(Income.user_id == current_user.id).order_by(Income.date.desc()).all()


@app.get("/income/{income_id}", response_model=IncomeOut)
def get_income(income_id:int, db:Session = Depends(get_db), current_user: User= Depends(get_current_user)):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    return income

@app.put("/income/{income_id}", response_model=IncomeOut)
def update_income(income_id: int, payload: IncomeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    for field, value in payload.model_dump().items():
        setattr(income, field, value)
    db.commit()
    db.refresh(income)
    return income





@app.delete("/income/{income_id}", status_code=204)
def delete_income(income_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    db.delete(income)
    db.commit()