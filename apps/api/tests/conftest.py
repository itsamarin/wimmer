"""Test configuration and fixtures."""
import os

# Must be set before any wimmer module is imported — session.py creates the engine at import time
os.environ["DATABASE_URL"] = "sqlite:///./test_wimmer.db"
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-tests-only")
os.environ.setdefault("LLM_PROVIDER", "mock")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from wimmer.db.base import Base
from wimmer.db.session import get_db
from wimmer.main import app

SQLALCHEMY_TEST_URL = "sqlite:///./test_wimmer.db"
engine_test = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    Base.metadata.drop_all(bind=engine_test)
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture(autouse=True)
def clean_tables(create_tables):
    """Delete all data between tests for isolation."""
    yield
    with engine_test.connect() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
        conn.commit()


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def registered_user(client):
    resp = client.post("/api/v1/auth/register", json={
        "email": "test@wimmer.dev",
        "password": "securepassword123",
        "full_name": "Test User",
    })
    assert resp.status_code == 201
    return resp.json()


@pytest.fixture
def auth_headers(client):
    client.post("/api/v1/auth/register", json={
        "email": "auth@wimmer.dev",
        "password": "securepassword123",
        "full_name": "Auth User",
    })
    resp = client.post("/api/v1/auth/login", json={
        "email": "auth@wimmer.dev",
        "password": "securepassword123",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
