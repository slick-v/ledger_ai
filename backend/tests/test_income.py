def _income_payload(**overrides):
    payload = {
        "amount": 50000,
        "category": "Salary",
        "account": "Bank",
        "notes": None,
        "date": "2026-01-01",
    }
    payload.update(overrides)
    return payload


def test_create_and_list_income(client, make_user, auth_headers):
    user = make_user()
    r = client.post("/income", json=_income_payload(), headers=auth_headers(user))
    assert r.status_code == 200
    assert r.json()["amount"] == "50000.00"

    listed = client.get("/income", headers=auth_headers(user))
    assert listed.status_code == 200
    assert len(listed.json()) == 1


def test_invalid_income_category_rejected(client, make_user, auth_headers):
    user = make_user()
    r = client.post("/income", json=_income_payload(category="Bonus"), headers=auth_headers(user))
    assert r.status_code == 422


def test_income_scoped_to_user(client, make_user, auth_headers):
    user1 = make_user()
    user2 = make_user()
    client.post("/income", json=_income_payload(), headers=auth_headers(user1))

    r = client.get("/income", headers=auth_headers(user2))
    assert r.status_code == 200
    assert r.json() == []


def test_delete_income(client, make_user, auth_headers):
    user = make_user()
    created = client.post("/income", json=_income_payload(), headers=auth_headers(user))
    income_id = created.json()["id"]

    deleted = client.delete(f"/income/{income_id}", headers=auth_headers(user))
    assert deleted.status_code == 204

    after = client.get(f"/income/{income_id}", headers=auth_headers(user))
    assert after.status_code == 404
