def test_health_check(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["database"] == "connected"


def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    assert "message" in r.json()
