import uuid

import pytest
from sqlalchemy import event
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import get_db, engine
from app.core.security import hash_password, create_access_token
from app.models.user import User


@pytest.fixture()
def db_session():
    """A DB session bound to a single connection + transaction, rolled back
    after the test. Each request inside the test may call db.commit() (the
    endpoints do) without actually persisting anything, via the classic
    SQLAlchemy nested-SAVEPOINT-restart pattern. Runs against the real Neon
    DB but never leaves data behind."""
    connection = engine.connect()
    transaction = connection.begin()
    TestingSessionLocal = sessionmaker(bind=connection, autoflush=False, autocommit=False)
    session = TestingSessionLocal()

    nested = connection.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def restart_savepoint(sess, trans):
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def make_user(db_session):
    def _make(email: str | None = None, password: str = "testpass123") -> User:
        email = email or f"test_{uuid.uuid4().hex[:12]}@example.com"
        user = User(email=email, hashed_password=hash_password(password))
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user

    return _make


@pytest.fixture()
def auth_headers():
    def _headers(user: User) -> dict:
        token = create_access_token(user_id=user.id)
        return {"Authorization": f"Bearer {token}"}

    return _headers
