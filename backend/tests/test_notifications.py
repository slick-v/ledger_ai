from app.core.config import settings


def test_send_daily_digest_requires_secret(client, monkeypatch):
    monkeypatch.setattr(settings, "NOTIFICATION_CRON_SECRET", "correct-secret")

    r = client.post("/notifications/send-daily-digest")
    assert r.status_code == 401


def test_send_daily_digest_rejects_wrong_secret(client, monkeypatch):
    monkeypatch.setattr(settings, "NOTIFICATION_CRON_SECRET", "correct-secret")

    r = client.post("/notifications/send-daily-digest", headers={"X-Cron-Secret": "wrong"})
    assert r.status_code == 401


def test_send_daily_digest_disabled_when_secret_unset(client, monkeypatch):
    monkeypatch.setattr(settings, "NOTIFICATION_CRON_SECRET", "")

    r = client.post("/notifications/send-daily-digest", headers={"X-Cron-Secret": ""})
    assert r.status_code == 401


def test_send_daily_digest_counts_eligible_opted_in_users(client, make_user, auth_headers, monkeypatch):
    monkeypatch.setattr(settings, "NOTIFICATION_CRON_SECRET", "correct-secret")
    # Ensure no real email attempt is made during the test.
    monkeypatch.setattr(settings, "RESEND_API_KEY", "")

    user = make_user()
    client.patch("/me", json={"email_notifications": True}, headers=auth_headers(user))

    r = client.post("/notifications/send-daily-digest", headers={"X-Cron-Secret": "correct-secret"})
    assert r.status_code == 200
    body = r.json()
    assert body["eligible_users"] >= 1
    assert body["sent"] == 0
    assert body["failed"] >= 1


def test_opted_out_user_excluded_from_eligible_count(db_session, make_user):
    from app.models.user import User

    before = db_session.query(User).filter(User.email_notifications.is_(True)).count()

    make_user()  # opted out by default (email_notifications=False)

    after = db_session.query(User).filter(User.email_notifications.is_(True)).count()
    assert after == before
