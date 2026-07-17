from pydantic import BaseModel, EmailStr

from datetime import date as date_type
from decimal import Decimal
from pydantic import BaseModel
from models import ExpenseCategory, IncomeCategory, AccountType


class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"



class ExpenseCreate(BaseModel):
    amount: Decimal
    category: ExpenseCategory
    account: AccountType
    merchant: str | None = None
    notes: str | None = None
    date: date_type

class ExpenseOut(ExpenseCreate):
    id: int

    class Config:
        from_attributes = True

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