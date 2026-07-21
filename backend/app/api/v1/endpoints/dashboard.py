from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardOut
from app.core.security import get_current_user
from app.services.dashboard_service import get_dashboard_data

router = APIRouter()


@router.get("", response_model=DashboardOut)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_dashboard_data(user_id=current_user.id, db=db)