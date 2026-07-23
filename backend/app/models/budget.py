from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, UniqueConstraint, func

from app.db.session import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String, nullable=False)          # expense category (title-case)
    amount = Column(Numeric(10, 2), nullable=False)     # monthly cap
    period = Column(String, nullable=False, default="monthly")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "category", name="uq_budget_user_category"),
    )
