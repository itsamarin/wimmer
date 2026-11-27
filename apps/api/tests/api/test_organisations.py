def test_create_organisation(client, auth_headers):
    resp = client.post("/api/v1/organisations", json={"name": "Test Hotels", "slug": "test-hotels"}, headers=auth_headers)
    assert resp.status_code == 201
    assert resp.json()["slug"] == "test-hotels"


def test_create_organisation_duplicate_slug(client, auth_headers):
    client.post("/api/v1/organisations", json={"name": "Alpha", "slug": "alpha-hotels"}, headers=auth_headers)
    resp = client.post("/api/v1/organisations", json={"name": "Alpha 2", "slug": "alpha-hotels"}, headers=auth_headers)
    assert resp.status_code == 400


def test_list_organisations(client, auth_headers):
    client.post("/api/v1/organisations", json={"name": "List Test", "slug": "list-test-org"}, headers=auth_headers)
    resp = client.get("/api/v1/organisations", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


def test_cannot_access_other_org(client, auth_headers):
    # Create org with first user
    org_resp = client.post("/api/v1/organisations", json={"name": "Private Org", "slug": "private-org-iso"}, headers=auth_headers)
    org_id = org_resp.json()["id"]

    # Register second user and get their token
    client.post("/api/v1/auth/register", json={"email": "other@wimmer.dev", "password": "password123", "full_name": "Other"})
    login = client.post("/api/v1/auth/login", json={"email": "other@wimmer.dev", "password": "password123"})
    other_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    # Other user should not access first user's org
    resp = client.get(f"/api/v1/organisations/{org_id}", headers=other_headers)
    assert resp.status_code in (403, 404)
