import enum

from sqlalchemy import Column, Integer, String, DateTime, Numeric, Date, ForeignKey, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class IncomeCategory(str, enum.Enum):
    SALARY = "Salary"
    INVESTMENT = "Investment"
    OTHER = "Other"


class Income(Base):
    __tablename__ = "income"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(String, nullable=False)
    account = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User")