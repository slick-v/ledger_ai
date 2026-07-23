import calendar
from datetime import date


def test_dashboard_requires_auth(client):
    r = client.get("/dashboard")
    assert r.status_code == 401


def test_dashboard_computes_balance_and_spent_today(client, make_user, auth_headers):
    user = make_user()
    today = date.today().isoformat()

    client.post(
        "/income",
        json={"amount": 5000, "category": "Salary", "account": "Bank", "notes": None, "date": today},
        headers=auth_headers(user),
    )
    client.post(
        "/expenses",
        json={"amount": 250, "category": "Food", "account": "UPI", "merchant": None, "notes": None, "date": today},
        headers=auth_headers(user),
    )
    client.post(
        "/expenses",
        json={"amount": 100, "category": "Fuel", "account": "Cash", "merchant": None, "notes": None, "date": "2020-01-01"},
        headers=auth_headers(user),
    )

    r = client.get("/dashboard", headers=auth_headers(user))
    assert r.status_code == 200
    body = r.json()
    assert body["total_income"] == "5000.00"
    assert body["total_expenses"] == "350.00"
    assert body["balance"] == "4650.00"
    assert body["spent_today"] == "250.00"


def test_dashboard_daily_budget_derived_from_monthly_budgets(client, make_user, auth_headers):
    user = make_user()
    client.put("/budgets", json={"category": "Food", "amount": 3000}, headers=auth_headers(user))
    client.put("/budgets", json={"category": "Bills", "amount": 1500}, headers=auth_headers(user))

    r = client.get("/dashboard", headers=auth_headers(user))
    body = r.json()

    today = date.today()
    days_in_month = calendar.monthrange(today.year, today.month)[1]
    expected_daily = round(4500 / days_in_month, 2)
    assert float(body["daily_budget"]) == expected_daily


def test_dashboard_no_budgets_gives_zero_daily_budget(client, make_user, auth_headers):
    user = make_user()
    r = client.get("/dashboard", headers=auth_headers(user))
    assert float(r.json()["daily_budget"]) == 0.0


def test_dashboard_account_balances(client, make_user, auth_headers):
    user = make_user()
    today = date.today().isoformat()
    client.post(
        "/income",
        json={"amount": 1000, "category": "Salary", "account": "Cash", "notes": None, "date": today},
        headers=auth_headers(user),
    )
    client.post(
        "/expenses",
        json={"amount": 300, "category": "Food", "account": "Cash", "merchant": None, "notes": None, "date": today},
        headers=auth_headers(user),
    )

    r = client.get("/dashboard", headers=auth_headers(user))
    accounts = {a["type"]: a["balance"] for a in r.json()["accounts"]}
    assert accounts["Cash"] == "700.00"
    assert accounts["UPI"] == "0"
    assert accounts["Bank"] == "0"
