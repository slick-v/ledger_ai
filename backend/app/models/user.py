from sqlalchemy import Column, Integer, String, Boolean, DateTime, func

from app.db.session import Base
from app.core.config import settings


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    email_notifications = Column(Boolean, nullable=False, server_default="false")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @property
    def is_admin(self) -> bool:
        return self.email in settings.admin_email_list
