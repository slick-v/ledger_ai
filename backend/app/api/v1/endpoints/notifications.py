from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.config import settings
from app.models.user import User
from app.services.notification_service import build_daily_digest, render_digest_html
from app.services.email_service import send_email

router = APIRouter()


@router.post("/send-daily-digest")
def send_daily_digest(
    x_cron_secret: str | None = Header(default=None, alias="X-Cron-Secret"),
    db: Session = Depends(get_db),
):
    if not settings.NOTIFICATION_CRON_SECRET or x_cron_secret != settings.NOTIFICATION_CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    users = db.query(User).filter(User.email_notifications.is_(True)).all()

    sent = 0
    failed = 0
    for user in users:
        digest = build_daily_digest(user_id=user.id, db=db)
        html = render_digest_html(digest)
        ok = send_email(user.email, "Your daily spend — Ledger AI", html)
        if ok:
            sent += 1
        else:
            failed += 1

    return {"eligible_users": len(users), "sent": sent, "failed": failed}
