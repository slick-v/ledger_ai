from app.core.config import settings


def test_admin_stats_requires_auth(client):
    r = client.get("/admin/stats")
    assert r.status_code == 401


def test_admin_stats_rejects_non_admin(client, make_user, auth_headers, monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_EMAILS", "nobody-admin@example.com")
    user = make_user()
    r = client.get("/admin/stats", headers=auth_headers(user))
    assert r.status_code == 403


def test_admin_stats_allows_admin(client, make_user, auth_headers, monkeypatch):
    user = make_user()
    monkeypatch.setattr(settings, "ADMIN_EMAILS", user.email)
    r = client.get("/admin/stats", headers=auth_headers(user))
    assert r.status_code == 200
    assert "total_users" in r.json()


def test_admin_users_allows_admin(client, make_user, auth_headers, monkeypatch):
    user = make_user()
    monkeypatch.setattr(settings, "ADMIN_EMAILS", user.email)
    r = client.get("/admin/users", headers=auth_headers(user))
    assert r.status_code == 200
    assert "users" in r.json()


def test_admin_users_rejects_non_admin(client, make_user, auth_headers, monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_EMAILS", "nobody-admin@example.com")
    user = make_user()
    r = client.get("/admin/users", headers=auth_headers(user))
    assert r.status_code == 403
