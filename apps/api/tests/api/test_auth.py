def test_register(client):
    resp = client.post("/api/v1/auth/register", json={
        "email": "new@wimmer.dev",
        "password": "password123",
        "full_name": "New User",
    })
    assert resp.status_code == 201
    assert resp.json()["email"] == "new@wimmer.dev"


def test_register_duplicate_email(client):
    client.post("/api/v1/auth/register", json={"email": "dup@wimmer.dev", "password": "password123", "full_name": "User"})
    resp = client.post("/api/v1/auth/register", json={"email": "dup@wimmer.dev", "password": "password123", "full_name": "User"})
    assert resp.status_code == 400


def test_login_success(client):
    client.post("/api/v1/auth/register", json={"email": "login@wimmer.dev", "password": "password123", "full_name": "Login User"})
    resp = client.post("/api/v1/auth/login", json={"email": "login@wimmer.dev", "password": "password123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={"email": "fail@wimmer.dev", "password": "password123", "full_name": "Fail"})
    resp = client.post("/api/v1/auth/login", json={"email": "fail@wimmer.dev", "password": "wrong"})
    assert resp.status_code == 401


def test_me_authenticated(client, auth_headers):
    resp = client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert "email" in resp.json()


def test_me_unauthenticated(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 403
