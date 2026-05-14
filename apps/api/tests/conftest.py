"""Shared fixtures for API integration tests."""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../packages/db-core"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../packages/shared"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../packages/ai-engine"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../packages/mcp-servers"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from main import app
from db_core import get_db
from auth import get_current_user, require_admin, create_access_token


# ---------------------------------------------------------------------------
# Database mock
# ---------------------------------------------------------------------------


@pytest.fixture
def mock_db():
    """Create a mock database session."""
    db = MagicMock()
    return db


@pytest.fixture
def client(mock_db):
    """TestClient with overridden DB dependency."""

    def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------


def _make_mock_user(role: str = "admin", user_id: int = 1, username: str = "testuser") -> MagicMock:
    """Create a mock user with the given role."""
    user = MagicMock()
    user.id = user_id
    user.username = username
    user.role = role
    user.is_active = True
    user.email = f"{username}@example.com"
    user.hashed_password = "hashed"
    user.failed_attempts = 0
    user.locked_until = None
    user.CreatedAt = "2026-01-01T00:00:00"
    return user


@pytest.fixture
def admin_user():
    """A mock admin user."""
    return _make_mock_user(role="admin", user_id=1, username="admin_user")


@pytest.fixture
def client_user():
    """A mock client (non-admin) user."""
    return _make_mock_user(role="client", user_id=2, username="client_user")


@pytest.fixture
def admin_client(mock_db, admin_user):
    """TestClient authenticated as admin."""

    def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: admin_user
    app.dependency_overrides[require_admin] = lambda: admin_user
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def client_role_client(mock_db, client_user):
    """TestClient authenticated as a non-admin client user."""

    async def _deny_admin():
        from fastapi import HTTPException

        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )

    def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: client_user
    app.dependency_overrides[require_admin] = _deny_admin
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def unauthenticated_client(mock_db):
    """TestClient with no auth overrides (simulates unauthenticated request)."""

    def override_get_db():
        yield mock_db

    app.dependency_overrides.clear()
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
