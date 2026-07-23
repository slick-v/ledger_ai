from app.core.config import settings


def test_ai_parse_requires_auth(client):
    r = client.post("/ai/parse-expense", json={"text": "spent 100 on food"})
    assert r.status_code == 401


def test_ai_parse_returns_503_when_not_configured(client, make_user, auth_headers, monkeypatch):
    # Force the "not configured" branch deterministically, regardless of
    # whether a real GROQ_API_KEY is set in the local/CI environment — we
    # never want tests to make a real network call to Groq.
    monkeypatch.setattr(settings, "GROQ_API_KEY", "")
    user = make_user()
    r = client.post("/ai/parse-expense", json={"text": "spent 100 on food"}, headers=auth_headers(user))
    assert r.status_code == 503


def test_ai_parse_rejects_empty_text(client, make_user, auth_headers, monkeypatch):
    monkeypatch.setattr(settings, "GROQ_API_KEY", "fake-key-for-this-test")
    user = make_user()
    r = client.post("/ai/parse-expense", json={"text": "   "}, headers=auth_headers(user))
    assert r.status_code == 400
