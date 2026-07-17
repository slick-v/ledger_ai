from sqlalchemy.orm import declarative_base
# from sqlalchemy import Column, Integer, String, DateTime, func
import enum
from sqlalchemy import Column, Integer, String, DateTime, Numeric, Date, Enum as SqlEnum, ForeignKey, func
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())




class ExpenseCategory(str, enum.Enum):
    FOOD = "Food"
    GROCERY = "Grocery"
    FUEL = "Fuel"
    SHOPPING = "Shopping"
    BILLS = "Bills"
    HEALTH = "Health"
    ENTERTAINMENT = "Entertainment"
    TRAVEL = "Travel"
    EDUCATION = "Education"
    OTHER = "Other"

class IncomeCategory(str, enum.Enum):
    SALARY = "Salary"
    INVESTMENT = "Investment"
    OTHER = "Other"

class AccountType(str, enum.Enum):
    CASH = "Cash"
    UPI = "UPI"
    BANK = "Bank"

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(SqlEnum(ExpenseCategory), nullable=False)
    account = Column(SqlEnum(AccountType), nullable=False)
    merchant = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User")

class Income(Base):
    __tablename__ = "income"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(SqlEnum(IncomeCategory), nullable=False)
    account = Column(SqlEnum(AccountType), nullable=False)
    notes = Column(String, nullable=True)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User")