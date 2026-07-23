def _expense_payload(**overrides):
    payload = {
        "amount": 100.50,
        "category": "Food",
        "account": "UPI",
        "merchant": "Test Cafe",
        "notes": None,
        "date": "2026-01-15",
    }
    payload.update(overrides)
    return payload


def test_expenses_require_auth(client):
    r = client.get("/expenses")
    assert r.status_code == 401


def test_create_expense(client, make_user, auth_headers):
    user = make_user()
    r = client.post("/expenses", json=_expense_payload(), headers=auth_headers(user))
    assert r.status_code == 200
    body = r.json()
    assert body["amount"] == "100.50"
    assert body["category"] == "Food"
    assert body["account"] == "UPI"
    assert body["merchant"] == "Test Cafe"


def test_invalid_category_rejected(client, make_user, auth_headers):
    user = make_user()
    r = client.post("/expenses", json=_expense_payload(category="NotACategory"), headers=auth_headers(user))
    assert r.status_code == 422


def test_invalid_account_rejected(client, make_user, auth_headers):
    user = make_user()
    r = client.post("/expenses", json=_expense_payload(account="Crypto"), headers=auth_headers(user))
    assert r.status_code == 422


def test_list_expenses_scoped_to_user(client, make_user, auth_headers):
    user1 = make_user()
    user2 = make_user()
    client.post("/expenses", json=_expense_payload(category="Food"), headers=auth_headers(user1))
    client.post("/expenses", json=_expense_payload(category="Fuel"), headers=auth_headers(user2))

    r1 = client.get("/expenses", headers=auth_headers(user1))
    assert r1.status_code == 200
    assert len(r1.json()) == 1
    assert r1.json()[0]["category"] == "Food"

    r2 = client.get("/expenses", headers=auth_headers(user2))
    assert len(r2.json()) == 1
    assert r2.json()[0]["category"] == "Fuel"


def test_cannot_access_other_users_expense(client, make_user, auth_headers):
    user1 = make_user()
    user2 = make_user()
    created = client.post("/expenses", json=_expense_payload(), headers=auth_headers(user1))
    expense_id = created.json()["id"]

    r = client.get(f"/expenses/{expense_id}", headers=auth_headers(user2))
    assert r.status_code == 404


def test_update_and_delete_expense(client, make_user, auth_headers):
    user = make_user()
    created = client.post("/expenses", json=_expense_payload(merchant="Original"), headers=auth_headers(user))
    expense_id = created.json()["id"]

    updated = client.put(
        f"/expenses/{expense_id}",
        json=_expense_payload(merchant="Updated", amount=45),
        headers=auth_headers(user),
    )
    assert updated.status_code == 200
    assert updated.json()["merchant"] == "Updated"

    deleted = client.delete(f"/expenses/{expense_id}", headers=auth_headers(user))
    assert deleted.status_code == 204

    after = client.get(f"/expenses/{expense_id}", headers=auth_headers(user))
    assert after.status_code == 404


def test_update_missing_expense_404(client, make_user, auth_headers):
    user = make_user()
    r = client.put("/expenses/999999999", json=_expense_payload(), headers=auth_headers(user))
    assert r.status_code == 404
