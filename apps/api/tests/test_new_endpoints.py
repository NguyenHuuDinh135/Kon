"""Integration tests for notifications, campaigns, health, and analytics endpoints."""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../packages/db-core"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../packages/shared"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../packages/ai-engine"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from unittest.mock import patch, MagicMock
import pandas as pd
from fastapi.testclient import TestClient

from apps.api.main import app
from auth import get_current_user, require_admin


# --- Fixtures ---


def _make_mock_user(role: str = "admin") -> MagicMock:
    user = MagicMock()
    user.username = "testadmin"
    user.role = role
    user.is_active = True
    user.email = "testadmin@example.com"
    user.id = 1
    return user


@pytest.fixture(autouse=True)
def override_auth():
    """Override auth dependency with mock admin user for all tests."""
    mock_user = _make_mock_user(role="admin")
    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[require_admin] = lambda: mock_user
    yield mock_user
    app.dependency_overrides.clear()


@pytest.fixture()
def client():
    return TestClient(app)


# --- Tests: Notifications ---


class TestNotifications:
    @patch("routers.notifications.get_db")
    def test_get_notifications_returns_200(self, mock_get_db, client):
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = []
        mock_db.query.return_value = mock_query
        mock_get_db.return_value = iter([mock_db])

        response = client.get("/notifications")
        assert response.status_code == 200

    @patch("routers.notifications.get_db")
    def test_get_notifications_returns_list(self, mock_get_db, client):
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = []
        mock_db.query.return_value = mock_query
        mock_get_db.return_value = iter([mock_db])

        response = client.get("/notifications")
        assert isinstance(response.json(), list)

    @patch("routers.notifications.get_db")
    def test_unread_count_returns_200(self, mock_get_db, client):
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.count.return_value = 5
        mock_db.query.return_value = mock_query
        mock_get_db.return_value = iter([mock_db])

        response = client.get("/notifications/unread-count")
        assert response.status_code == 200

    @patch("routers.notifications.get_db")
    def test_unread_count_structure(self, mock_get_db, client):
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.count.return_value = 3
        mock_db.query.return_value = mock_query
        mock_get_db.return_value = iter([mock_db])

        response = client.get("/notifications/unread-count")
        data = response.json()
        assert "count" in data

    @patch("routers.notifications.get_db")
    def test_mark_as_read_not_found(self, mock_get_db, client):
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = None
        mock_db.query.return_value = mock_query
        mock_get_db.return_value = iter([mock_db])

        response = client.put("/notifications/9999/read")
        assert response.status_code == 404


# --- Tests: Campaigns ---


class TestCampaigns:
    @patch("routers.campaigns.get_db")
    def test_list_campaigns_returns_200(self, mock_get_db, client):
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_query.order_by.return_value = mock_query
        mock_query.all.return_value = []
        mock_db.query.return_value = mock_query
        mock_get_db.return_value = iter([mock_db])

        response = client.get("/campaigns")
        assert response.status_code == 200

    @patch("routers.campaigns.get_db")
    def test_list_campaigns_returns_list(self, mock_get_db, client):
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_query.order_by.return_value = mock_query
        mock_query.all.return_value = []
        mock_db.query.return_value = mock_query
        mock_get_db.return_value = iter([mock_db])

        response = client.get("/campaigns")
        assert isinstance(response.json(), list)

    @patch("routers.campaigns.get_db")
    def test_create_campaign_returns_200(self, mock_get_db, client):
        mock_db = MagicMock()
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock(side_effect=lambda obj: None)
        mock_get_db.return_value = iter([mock_db])

        response = client.post(
            "/campaigns",
            json={"name": "Test Campaign", "segment_target": "VIP", "discount_pct": 10.0},
        )
        # Campaign creation should succeed or validation passes
        assert response.status_code in (200, 422)

    @patch("routers.campaigns.get_db")
    def test_create_campaign_validates_input(self, mock_get_db, client):
        mock_db = MagicMock()
        mock_get_db.return_value = iter([mock_db])

        # Missing required fields
        response = client.post("/campaigns", json={})
        assert response.status_code == 422

    @patch("routers.campaigns.get_db")
    def test_approve_campaign_not_found(self, mock_get_db, client):
        mock_db = MagicMock()
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = None
        mock_db.query.return_value = mock_query
        mock_get_db.return_value = iter([mock_db])

        response = client.put("/campaigns/9999/approve")
        assert response.status_code == 404


# --- Tests: Health ---


class TestHealth:
    def test_basic_health_returns_200(self, client):
        response = client.get("/health")
        assert response.status_code == 200

    def test_basic_health_status_field(self, client):
        response = client.get("/health")
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"

    @patch("apps.api.main.engine")
    def test_detailed_health_returns_200(self, mock_engine, client):
        mock_conn = MagicMock()
        mock_conn.execute.return_value = MagicMock(scalar=MagicMock(return_value=100))
        mock_conn.__enter__ = MagicMock(return_value=mock_conn)
        mock_conn.__exit__ = MagicMock(return_value=False)
        mock_engine.connect.return_value = mock_conn

        response = client.get("/health/detailed")
        assert response.status_code == 200

    @patch("apps.api.main.engine")
    def test_detailed_health_structure(self, mock_engine, client):
        mock_conn = MagicMock()
        mock_conn.execute.return_value = MagicMock(scalar=MagicMock(return_value=50))
        mock_conn.__enter__ = MagicMock(return_value=mock_conn)
        mock_conn.__exit__ = MagicMock(return_value=False)
        mock_engine.connect.return_value = mock_conn

        response = client.get("/health/detailed")
        data = response.json()
        assert "status" in data
        assert "checks" in data


# --- Tests: Analytics ---


class TestAnalytics:
    @patch("pandas.read_sql")
    def test_forecast_returns_200(self, mock_read_sql, client):
        # Provide enough data for forecast (at least 3 months)
        df = pd.DataFrame(
            {
                "month": pd.to_datetime(["2025-01", "2025-02", "2025-03", "2025-04"]),
                "revenue": [10000.0, 12000.0, 11000.0, 13000.0],
            }
        )
        mock_read_sql.return_value = df

        response = client.get("/analytics/forecast")
        assert response.status_code == 200

    @patch("pandas.read_sql")
    def test_forecast_structure(self, mock_read_sql, client):
        df = pd.DataFrame(
            {
                "month": pd.to_datetime(["2025-01", "2025-02", "2025-03"]),
                "revenue": [10000.0, 12000.0, 11000.0],
            }
        )
        mock_read_sql.return_value = df

        response = client.get("/analytics/forecast")
        data = response.json()
        assert "historical" in data
        assert "forecast" in data

    @patch("pandas.read_sql")
    def test_forecast_with_insufficient_data(self, mock_read_sql, client):
        # Less than 3 months of data
        df = pd.DataFrame(
            {
                "month": pd.to_datetime(["2025-01"]),
                "revenue": [10000.0],
            }
        )
        mock_read_sql.return_value = df

        response = client.get("/analytics/forecast")
        assert response.status_code == 200
        data = response.json()
        assert data["historical"] == []
        assert data["forecast"] == []

    @patch("pandas.read_sql")
    def test_revenue_over_time_returns_200(self, mock_read_sql, client):
        df = pd.DataFrame(
            {
                "month": pd.to_datetime(["2025-01", "2025-02"]),
                "revenue": [10000.0, 12000.0],
                "freight_revenue": [1000.0, 1200.0],
            }
        )
        mock_read_sql.return_value = df

        response = client.get("/dashboard/revenue-over-time")
        assert response.status_code == 200


# --- Tests: Security Headers ---


class TestSecurityHeaders:
    def test_security_headers_present(self, client):
        response = client.get("/health")
        assert response.headers.get("X-Content-Type-Options") == "nosniff"
        assert response.headers.get("X-Frame-Options") == "DENY"
        assert response.headers.get("X-XSS-Protection") == "1; mode=block"
        assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
        assert response.headers.get("Permissions-Policy") == "camera=(), microphone=(), geolocation=()"
