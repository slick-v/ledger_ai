import uuid


def _unique_email() -> str:
    return f"test_{uuid.uuid4().hex[:12]}@example.com"


def test_register_creates_user(client):
    email = _unique_email()
    r = client.post("/register", json={"email": email, "password": "testpass123"})
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == email
    assert body["is_admin"] is False
    assert body["email_notifications"] is False


def test_register_duplicate_email_rejected(client):
    email = _unique_email()
    client.post("/register", json={"email": email, "password": "testpass123"})
    r = client.post("/register", json={"email": email, "password": "testpass123"})
    assert r.status_code == 400


def test_login_success(client):
    email = _unique_email()
    client.post("/register", json={"email": email, "password": "testpass123"})
    r = client.post("/login", json={"email": email, "password": "testpass123"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_wrong_password_rejected(client):
    email = _unique_email()
    client.post("/register", json={"email": email, "password": "testpass123"})
    r = client.post("/login", json={"email": email, "password": "wrongpassword"})
    assert r.status_code == 401


def test_login_unknown_email_rejected(client):
    r = client.post("/login", json={"email": _unique_email(), "password": "whatever123"})
    assert r.status_code == 401


def test_me_requires_auth(client):
    r = client.get("/me")
    assert r.status_code == 401


def test_me_returns_current_user(client, make_user, auth_headers):
    user = make_user()
    r = client.get("/me", headers=auth_headers(user))
    assert r.status_code == 200
    assert r.json()["email"] == user.email


def test_patch_me_toggles_email_notifications(client, make_user, auth_headers):
    user = make_user()
    r = client.patch("/me", json={"email_notifications": True}, headers=auth_headers(user))
    assert r.status_code == 200
    assert r.json()["email_notifications"] is True

    r = client.patch("/me", json={"email_notifications": False}, headers=auth_headers(user))
    assert r.json()["email_notifications"] is False
