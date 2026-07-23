from datetime import date


def test_budgets_require_auth(client):
    r = client.get("/budgets")
    assert r.status_code == 401


def test_empty_budget_summary(client, make_user, auth_headers):
    user = make_user()
    r = client.get("/budgets", headers=auth_headers(user))
    assert r.status_code == 200
    body = r.json()
    assert body["budgets"] == []
    assert body["total_budget"] == "0"


def test_set_budget_and_compute_spent(client, make_user, auth_headers):
    user = make_user()
    r = client.put("/budgets", json={"category": "Food", "amount": 1000}, headers=auth_headers(user))
    assert r.status_code == 204

    client.post(
        "/expenses",
        json={
            "amount": 1200, "category": "Food", "account": "UPI",
            "merchant": None, "notes": None, "date": date.today().isoformat(),
        },
        headers=auth_headers(user),
    )

    summary = client.get("/budgets", headers=auth_headers(user)).json()
    assert summary["total_budget"] == "1000.00"
    assert summary["total_spent"] == "1200.00"
    assert summary["over_count"] == 1

    food = next(b for b in summary["budgets"] if b["category"] == "Food")
    assert food["over"] is True
    assert food["pct"] == 120


def test_budget_excludes_expenses_from_other_months(client, make_user, auth_headers):
    user = make_user()
    client.put("/budgets", json={"category": "Bills", "amount": 500}, headers=auth_headers(user))
    client.post(
        "/expenses",
        json={
            "amount": 5000, "category": "Bills", "account": "Bank",
            "merchant": None, "notes": None, "date": "2020-01-01",
        },
        headers=auth_headers(user),
    )

    summary = client.get("/budgets", headers=auth_headers(user)).json()
    bills = next(b for b in summary["budgets"] if b["category"] == "Bills")
    assert bills["spent"] == "0"
    assert bills["over"] is False


def test_budget_zero_amount_clears_it(client, make_user, auth_headers):
    user = make_user()
    client.put("/budgets", json={"category": "Bills", "amount": 500}, headers=auth_headers(user))
    r = client.put("/budgets", json={"category": "Bills", "amount": 0}, headers=auth_headers(user))
    assert r.status_code == 204

    summary = client.get("/budgets", headers=auth_headers(user)).json()
    assert summary["budgets"] == []


def test_budget_invalid_category_rejected(client, make_user, auth_headers):
    user = make_user()
    r = client.put("/budgets", json={"category": "NotACategory", "amount": 100}, headers=auth_headers(user))
    assert r.status_code == 400


def test_delete_budget(client, make_user, auth_headers):
    user = make_user()
    client.put("/budgets", json={"category": "Travel", "amount": 2000}, headers=auth_headers(user))
    r = client.delete("/budgets/Travel", headers=auth_headers(user))
    assert r.status_code == 204

    summary = client.get("/budgets", headers=auth_headers(user)).json()
    assert summary["budgets"] == []
