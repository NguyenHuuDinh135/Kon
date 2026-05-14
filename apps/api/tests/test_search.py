"""Tests for the /search/behavior endpoint."""

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

from main import app
from db_core import get_db
from auth import get_current_user, require_admin


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


def _make_mock_user(role: str = "admin") -> MagicMock:
    user = MagicMock()
    user.id = 1
    user.username = "testuser"
    user.role = role
    user.is_active = True
    user.email = "testuser@example.com"
    return user


@pytest.fixture
def mock_db():
    db = MagicMock()
    return db


@pytest.fixture
def authenticated_client(mock_db):
    """Client with auth override for admin user."""
    mock_user = _make_mock_user(role="admin")

    def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[require_admin] = lambda: mock_user
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def unauthenticated_client(mock_db):
    """Client with no auth overrides."""

    def override_get_db():
        yield mock_db

    app.dependency_overrides.clear()
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


class TestSearchBehavior:
    def test_search_requires_auth(self, unauthenticated_client):
        """Unauthenticated request to /search/behavior returns 401."""
        response = unauthenticated_client.get(
            "/search/behavior", params={"query": "high spending customers"}
        )
        assert response.status_code == 401

    @patch("routers.search.get_embeddings")
    @patch("routers.search.engine")
    def test_search_returns_correct_schema(
        self, mock_engine, mock_get_embeddings, authenticated_client
    ):
        """Successful search returns results with correct customer_churn fields."""
        mock_get_embeddings.return_value = [0.1] * 768

        mock_conn = MagicMock()
        mock_result = MagicMock()
        mock_result.keys.return_value = [
            "CustomerID",
            "Gender",
            "Tenure",
            "CityTier",
            "PreferedOrderCat",
            "SatisfactionScore",
            "OrderCount",
            "CashbackAmount",
            "distance",
        ]
        mock_result.fetchall.return_value = [
            (101, "Male", 12, 1, "Laptop & Accessory", 4, 5, 150.50, 0.23),
            (102, "Female", 24, 2, "Fashion", 5, 8, 250.00, 0.31),
        ]
        mock_conn.execute.return_value = mock_result
        mock_conn.__enter__ = MagicMock(return_value=mock_conn)
        mock_conn.__exit__ = MagicMock(return_value=False)
        mock_engine.connect.return_value = mock_conn

        response = authenticated_client.get(
            "/search/behavior", params={"query": "loyal customers"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "total" in data
        assert data["total"] == 2

        result = data["results"][0]
        assert "CustomerID" in result
        assert "Gender" in result
        assert "Tenure" in result
        assert "CityTier" in result
        assert "PreferedOrderCat" in result
        assert "SatisfactionScore" in result
        assert "OrderCount" in result
        assert "CashbackAmount" in result
        assert "distance" in result
        assert isinstance(result["distance"], float)

    @patch("routers.search.get_embeddings")
    @patch("routers.search.engine")
    def test_search_error_does_not_leak_details(
        self, mock_engine, mock_get_embeddings, authenticated_client
    ):
        """When embedding or DB fails, response gives a generic error without stack trace."""
        mock_get_embeddings.side_effect = Exception(
            "Connection refused: cannot connect to embedding service"
        )

        response = authenticated_client.get(
            "/search/behavior", params={"query": "test query"}
        )

        assert response.status_code == 500
        data = response.json()
        assert "detail" in data
        # Should contain some message but not expose full internal paths
        assert "Search failed" in data["detail"]
