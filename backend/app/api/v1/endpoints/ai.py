import json
import urllib.request
import urllib.error
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User
from app.models.expense import ExpenseCategory, AccountType

router = APIRouter()

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
CATEGORIES = [c.value for c in ExpenseCategory]
ACCOUNTS = [a.value for a in AccountType]


class ParseRequest(BaseModel):
    text: str


class ParsedExpense(BaseModel):
    amount: float
    category: str
    account: str
    merchant: str | None = None
    date: date


def _build_prompt(text: str) -> list[dict]:
    system = (
        "You extract structured expense data from a short natural-language note written by "
        "an Indian user. Amounts are in INR (rupees). Respond with ONLY a JSON object, no prose.\n"
        "Fields:\n"
        '- "amount": number (rupees, no currency symbol)\n'
        f'- "category": one of exactly {CATEGORIES}\n'
        f'- "account": one of exactly {ACCOUNTS} (default "UPI" if unclear)\n'
        '- "merchant": the shop/service name if present, else null\n'
        '- "date": ISO date YYYY-MM-DD; use today if not mentioned\n'
        f"Today is {date.today().isoformat()}."
    )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": text},
    ]


@router.post("/parse-expense", response_model=ParsedExpense)
def parse_expense(payload: ParseRequest, current_user: User = Depends(get_current_user)):
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="AI parsing is not configured")
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")

    body = json.dumps({
        "model": settings.GROQ_MODEL,
        "messages": _build_prompt(payload.text),
        "temperature": 0,
        "response_format": {"type": "json_object"},
    }).encode("utf-8")

    req = urllib.request.Request(
        GROQ_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "ignore")[:200]
        raise HTTPException(status_code=502, detail=f"AI service error: {detail}")
    except Exception:
        raise HTTPException(status_code=502, detail="Could not reach the AI service")

    try:
        content = data["choices"][0]["message"]["content"]
        parsed = json.loads(content)
    except (KeyError, IndexError, json.JSONDecodeError):
        raise HTTPException(status_code=502, detail="AI returned an unexpected response")

    # Normalize / clamp to valid values so the model can't inject bad data.
    try:
        amount = round(float(parsed.get("amount") or 0), 2)
    except (TypeError, ValueError):
        amount = 0.0

    category = parsed.get("category") if parsed.get("category") in CATEGORIES else "Other"
    account = parsed.get("account") if parsed.get("account") in ACCOUNTS else "UPI"
    merchant = parsed.get("merchant") or None

    parsed_date = date.today()
    raw_date = parsed.get("date")
    if isinstance(raw_date, str):
        try:
            parsed_date = date.fromisoformat(raw_date)
        except ValueError:
            parsed_date = date.today()

    return ParsedExpense(
        amount=amount,
        category=category,
        account=account,
        merchant=merchant,
        date=parsed_date,
    )
