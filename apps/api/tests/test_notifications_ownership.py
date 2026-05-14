"""Tests for notification ownership and access control."""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../packages/db-core"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../packages/shared"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../packages/ai-engine"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../packages/mcp-servers"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import HTTPException

from main import app
from db_core import get_db
from auth import get_current_user, require_admin


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


def _make_mock_user(user_id: int = 1, role: str = "client") -> MagicMock:
    user = MagicMock()
    user.id = user_id
    user.username = f"user_{user_id}"
    user.role = role
    user.is_active = True
    user.email = f"user_{user_id}@example.com"
    return user


def _make_mock_notification(
    notification_id: int = 1,
    user_id: int = 1,
    is_read: bool = False,
    title: str = "Test Notification",
) -> MagicMock:
    notif = MagicMock()
    notif.id = notification_id
    notif.user_id = user_id
    notif.type = "info"
    notif.title = title
    notif.message = "Test message"
    notif.is_read = is_read
    notif.created_at = "2026-01-01T00:00:00"
    return notif


@pytest.fixture
def mock_db():
    return MagicMock()


def _make_client_for_user(mock_db, user):
    """Create a TestClient authenticated as the given user."""

    def override_get_db():
        yield mock_db

    app.dependency_overrides.clear()
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: user
    return TestClient(app)


# ---------------------------------------------------------------------------
# Tests: Notification ownership
# ---------------------------------------------------------------------------


class TestNotificationOwnership:
    def test_mark_own_notification_read(self, mock_db):
        """User can mark their own notification as read -> 200."""
        user = _make_mock_user(user_id=1)
        notif = _make_mock_notification(notification_id=10, user_id=1, is_read=False)

        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = notif
        mock_db.query.return_value = mock_query

        client = _make_client_for_user(mock_db, user)

        response = client.put("/notifications/10/read")

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Marked as read"
        # Verify is_read was set to True
        assert notif.is_read is True

        app.dependency_overrides.clear()

    def test_cannot_mark_other_users_notification(self, mock_db):
        """User tries to mark another user's notification as read — returns 403."""
        user = _make_mock_user(user_id=2)  # user 2 trying to mark user 1's notif
        notif = _make_mock_notification(notification_id=10, user_id=1, is_read=False)

        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = notif
        mock_db.query.return_value = mock_query

        client = _make_client_for_user(mock_db, user)

        response = client.put("/notifications/10/read")

        assert response.status_code == 403

        app.dependency_overrides.clear()

    def test_can_mark_broadcast_notification(self, mock_db):
        """Notification with user_id=None (broadcast) can be marked by anyone -> 200."""
        user = _make_mock_user(user_id=5)
        # Broadcast notification has user_id=None
        notif = _make_mock_notification(notification_id=20, user_id=None, is_read=False)

        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = notif
        mock_db.query.return_value = mock_query

        client = _make_client_for_user(mock_db, user)

        response = client.put("/notifications/20/read")

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Marked as read"
        assert notif.is_read is True

        app.dependency_overrides.clear()

    def test_mark_nonexistent_notification(self, mock_db):
        """Marking a non-existent notification returns 404."""
        user = _make_mock_user(user_id=1)

        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = None
        mock_db.query.return_value = mock_query

        client = _make_client_for_user(mock_db, user)

        response = client.put("/notifications/9999/read")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

        app.dependency_overrides.clear()

    def test_get_notifications_filters_by_user(self, mock_db):
        """GET /notifications returns only the current user's + broadcast notifications."""
        user = _make_mock_user(user_id=3)
        own_notif = _make_mock_notification(notification_id=1, user_id=3)
        broadcast_notif = _make_mock_notification(notification_id=2, user_id=None)

        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [own_notif, broadcast_notif]
        mock_db.query.return_value = mock_query

        client = _make_client_for_user(mock_db, user)

        response = client.get("/notifications")

        assert response.status_code == 200

        app.dependency_overrides.clear()
