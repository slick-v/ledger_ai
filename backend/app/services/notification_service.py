from datetime import date
from decimal import Decimal

from sqlalchemy import func as sql_func
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.services.budget_service import get_budget_summary


def build_daily_digest(user_id: int, db: Session) -> dict:
    spent_today = (
        db.query(sql_func.coalesce(sql_func.sum(Expense.amount), 0))
        .filter(Expense.user_id == user_id, Expense.date == date.today())
        .scalar()
    )

    budget_summary = get_budget_summary(user_id=user_id, db=db)
    over_categories = [b.category for b in budget_summary.budgets if b.over]

    return {
        "spent_today": Decimal(spent_today),
        "total_spent_month": budget_summary.total_spent,
        "total_budget_month": budget_summary.total_budget,
        "over_categories": over_categories,
    }


def render_digest_html(digest: dict) -> str:
    over = digest["over_categories"]
    over_html = (
        f'<p style="margin:12px 0 0;color:#dc2626;font-size:13px;">'
        f'⚠️ Over budget: {", ".join(over)}</p>'
        if over else ""
    )

    budget_line = ""
    if digest["total_budget_month"] > 0:
        budget_line = (
            f'<p style="margin:16px 0 0;color:#6b7280;font-size:13px;">'
            f'This month: ₹{digest["total_spent_month"]:.2f} of '
            f'₹{digest["total_budget_month"]:.2f} budgeted.</p>'
        )

    return f"""
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:420px;margin:0 auto;padding:24px 20px;">
      <p style="color:#94a3b8;font-size:12px;letter-spacing:1px;text-transform:uppercase;margin:0;">Spent today</p>
      <p style="color:#0f1b2d;font-size:32px;font-weight:800;margin:8px 0 0;">₹{digest["spent_today"]:.2f}</p>
      {over_html}
      {budget_line}
      <p style="margin:24px 0 0;color:#c4c4b8;font-size:11px;">
        Ledger AI · you're getting this because you turned on daily email digests in Settings.
      </p>
    </div>
    """
