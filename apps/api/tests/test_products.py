"""Tests for product CRUD endpoints."""

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


def _make_mock_user(role: str = "admin", user_id: int = 1) -> MagicMock:
    user = MagicMock()
    user.id = user_id
    user.username = f"user_{role}"
    user.role = role
    user.is_active = True
    user.email = f"user_{role}@example.com"
    return user


def _make_mock_product(product_id: str = "prod_001") -> MagicMock:
    product = MagicMock()
    product.product_id = product_id
    product.product_category_name = "electronics"
    product.product_name_lenght = 20.0
    product.product_description_lenght = 100.0
    product.product_photos_qty = 3.0
    product.product_weight_g = 500.0
    product.product_length_cm = 20.0
    product.product_height_cm = 10.0
    product.product_width_cm = 15.0
    return product


@pytest.fixture
def mock_db():
    return MagicMock()


@pytest.fixture
def admin_client(mock_db):
    """Client authenticated as admin."""
    mock_user = _make_mock_user(role="admin")

    def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[require_admin] = lambda: mock_user
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def client_role_client(mock_db):
    """Client authenticated as non-admin 'client' role."""
    mock_user = _make_mock_user(role="client", user_id=2)

    async def _deny_admin():
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )

    def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[require_admin] = _deny_admin
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def public_client(mock_db):
    """Client with no auth overrides (for public endpoints like GET /products)."""

    def override_get_db():
        yield mock_db

    app.dependency_overrides.clear()
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Tests: GET /products (public)
# ---------------------------------------------------------------------------


class TestGetProducts:
    def test_get_products_public(self, mock_db, public_client):
        """GET /products works without auth (no get_current_user dependency)."""
        mock_product = _make_mock_product()
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [mock_product]
        mock_db.query.return_value = mock_query

        response = public_client.get("/products")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["product_id"] == "prod_001"

    def test_get_products_with_category_filter(self, mock_db, admin_client):
        """GET /products?category=electronics filters correctly."""
        mock_product = _make_mock_product()
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.offset.return_value = mock_query
        mock_query.limit.return_value = mock_query
        mock_query.all.return_value = [mock_product]
        mock_db.query.return_value = mock_query

        response = admin_client.get("/products", params={"category": "electronics"})

        assert response.status_code == 200


# ---------------------------------------------------------------------------
# Tests: DELETE /products/{id} (admin only)
# ---------------------------------------------------------------------------


class TestDeleteProduct:
    def test_delete_product_admin_only(self, mock_db, client_role_client):
        """DELETE /products/{id} with client token returns 403."""
        response = client_role_client.delete("/products/prod_001")

        assert response.status_code == 403

    def test_delete_product_success(self, mock_db, admin_client):
        """DELETE /products/{id} with admin token returns 200."""
        mock_product = _make_mock_product()
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = mock_product
        mock_db.query.return_value = mock_query

        response = admin_client.delete("/products/prod_001")

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Product deleted"

    def test_delete_product_not_found(self, mock_db, admin_client):
        """DELETE /products/{id} for non-existent product returns 404."""
        mock_query = MagicMock()
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = None
        mock_db.query.return_value = mock_query

        response = admin_client.delete("/products/nonexistent_id")

        assert response.status_code == 404
