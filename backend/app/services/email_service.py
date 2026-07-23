import json
import urllib.request
import urllib.error
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

RESEND_URL = "https://api.resend.com/emails"


def send_email(to: str, subject: str, html: str) -> bool:
    if not settings.RESEND_API_KEY:
        return False

    body = json.dumps({
        "from": settings.RESEND_FROM_EMAIL,
        "to": [to],
        "subject": subject,
        "html": html,
    }).encode("utf-8")

    req = urllib.request.Request(
        RESEND_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
            # Cloudflare-fronted APIs (see the Groq integration) reject the
            # default "Python-urllib" user-agent; send a normal one.
            "User-Agent": "Mozilla/5.0 (compatible; LedgerAI/1.0)",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            resp.read()
        return True
    except urllib.error.HTTPError as e:
        logger.warning("Resend send to %s failed: %s", to, e.read().decode("utf-8", "ignore")[:200])
        return False
    except Exception as e:
        logger.warning("Resend send to %s failed: %s", to, e)
        return False
