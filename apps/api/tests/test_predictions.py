"""Integration tests for ML prediction and analytics endpoints."""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../packages/db-core"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../packages/shared"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../packages/ai-engine"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../packages/mcp-servers"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from unittest.mock import patch, MagicMock
import pandas as pd
from fastapi.testclient import TestClient

from main import app
from auth import get_current_user, require_admin


# --- Fixtures ---


def _make_mock_user(role: str = "admin") -> MagicMock:
    user = MagicMock()
    user.username = "testuser"
    user.role = role
    user.is_active = True
    user.email = "testuser@example.com"
    user.id = 1
    return user


@pytest.fixture(autouse=True)
def override_auth():
    """Override auth dependency with mock admin user for all tests by default."""
    mock_user = _make_mock_user(role="admin")

    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[require_admin] = lambda: mock_user
    yield mock_user
    app.dependency_overrides.clear()


@pytest.fixture()
def non_admin_override():
    """Override auth with a non-admin user."""
    mock_user = _make_mock_user(role="viewer")

    async def _deny_admin():
        from fastapi import HTTPException

        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )

    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[require_admin] = _deny_admin
    yield mock_user
    app.dependency_overrides.clear()


@pytest.fixture()
def no_auth_override():
    """Remove auth overrides to test unauthenticated access."""
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


@pytest.fixture()
def client():
    return TestClient(app)


# --- Sample DataFrames ---

SAMPLE_BEHAVIOR_DF = pd.DataFrame(
    {
        "CustomerID": [1, 2, 3],
        "Gender": ["Male", "Female", "Male"],
        "Age": [30, 45, 22],
        "income": [50, 80, 30],
        "spending_score": [60, 85, 40],
        "predicted_category": ["Medium", "High", "Low"],
        "confidence": [0.85, 0.92, 0.78],
        "Cluster": [0, 1, 2],
    }
)

SAMPLE_CLUSTERING_DF = pd.DataFrame(
    {
        "CustomerID": [1, 2, 3, 4],
        "Gender": ["Male", "Female", "Male", "Female"],
        "Age": [30, 45, 22, 55],
        "income": [50, 80, 30, 90],
        "spending_score": [60, 85, 40, 70],
        "Cluster": [0, 1, 2, 0],
    }
)

SAMPLE_LOGISTIC_DF = pd.DataFrame(
    {
        "CustomerID": [1, 2, 3],
        "Gender": ["Male", "Female", "Male"],
        "Age": [30, 45, 22],
        "income": [50, 80, 30],
        "spending_score": [60, 85, 40],
        "churn_predicted": [1, 0, 1],
        "churn_probability": [0.85, 0.20, 0.72],
    }
)

SAMPLE_COMPARE_DF = pd.DataFrame(
    {
        "CustomerID": [1, 2],
        "Gender": ["Male", "Female"],
        "Age": [30, 45],
        "income": [50, 80],
        "spending_score": [60, 85],
        "Cluster": [0, 1],
        "DT_Label": ["Medium", "High"],
        "DT_Confidence": [0.85, 0.92],
        "Churn_Prediction": [1, 0],
        "Churn_Probability": [0.85, 0.20],
    }
)

SAMPLE_METRICS_DF = pd.DataFrame(
    {
        "model_name": ["decision_tree", "kmeans", "logistic_regression"],
        "accuracy": [0.87, None, 0.82],
        "precision_score": [0.85, None, 0.80],
        "recall": [0.88, None, 0.79],
        "f1_score": [0.86, None, 0.79],
        "parameters": ["{}", "{}", "{}"],
        "trained_at": ["2026-01-01", "2026-01-01", "2026-01-01"],
    }
)

SAMPLE_REVENUE_SEGMENT_DF = pd.DataFrame(
    {
        "segment_id": [0, 1, 2],
        "customer_count": [15, 30, 20],
        "order_count": [50, 100, 40],
        "total_revenue": [25000.0, 80000.0, 15000.0],
        "avg_order_value": [500.0, 800.0, 375.0],
    }
)

SAMPLE_CHURN_DEMOGRAPHICS_DF = pd.DataFrame(
    {
        "gender": ["Male", "Male", "Female", "Female"],
        "age_group": ["18-24", "25-34", "18-24", "25-34"],
        "total": [10, 15, 12, 18],
        "churned": [3, 5, 2, 6],
        "avg_churn_prob": [0.35, 0.42, 0.28, 0.39],
    }
)

SAMPLE_SPENDING_DIST_DF = pd.DataFrame(
    {
        "spending_category": ["High", "Medium", "Low"],
        "customer_count": [20, 50, 30],
        "avg_income": [85.5, 55.2, 30.1],
        "avg_spending": [88.0, 55.0, 25.0],
        "avg_age": [35.5, 40.2, 28.0],
        "avg_confidence": [0.91, 0.84, 0.77],
    }
)


# --- Tests: Decision Tree Predictions ---


class TestDecisionTreePredictions:
    @patch("pandas.read_sql")
    def test_returns_200_with_predictions(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_BEHAVIOR_DF.copy()

        response = client.get("/predictions/decision-tree")

        assert response.status_code == 200
        data = response.json()
        assert "predictions" in data
        assert "summary" in data
        assert "total" in data
        assert len(data["predictions"]) == 3
        assert data["total"] == 3

    @patch("pandas.read_sql")
    def test_response_structure(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_BEHAVIOR_DF.copy()

        response = client.get("/predictions/decision-tree")
        data = response.json()

        prediction = data["predictions"][0]
        assert "CustomerID" in prediction
        assert "Gender" in prediction
        assert "Age" in prediction
        assert "income" in prediction
        assert "spending_score" in prediction
        assert "predicted_category" in prediction
        assert "confidence" in prediction

    @patch("pandas.read_sql")
    def test_summary_contains_category_counts(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_BEHAVIOR_DF.copy()

        response = client.get("/predictions/decision-tree")
        data = response.json()

        summary = data["summary"]
        assert isinstance(summary, dict)
        assert "Medium" in summary or "High" in summary or "Low" in summary

    @patch("pandas.read_sql")
    def test_empty_database_returns_empty(self, mock_read_sql, client):
        mock_read_sql.return_value = pd.DataFrame()

        response = client.get("/predictions/decision-tree")

        assert response.status_code == 200
        data = response.json()
        assert data["predictions"] == []
        assert data["summary"] == {}


# --- Tests: Clustering Predictions ---


class TestClusteringPredictions:
    @patch("pandas.read_sql")
    def test_returns_200_with_clusters(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_CLUSTERING_DF.copy()

        response = client.get("/predictions/clustering")

        assert response.status_code == 200
        data = response.json()
        assert "predictions" in data
        assert "clusters" in data
        assert "total" in data
        assert data["total"] == 4

    @patch("pandas.read_sql")
    def test_cluster_summary_structure(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_CLUSTERING_DF.copy()

        response = client.get("/predictions/clustering")
        data = response.json()

        for cluster in data["clusters"]:
            assert "cluster_id" in cluster
            assert "label" in cluster
            assert "count" in cluster
            assert "avg_income" in cluster
            assert "avg_spending" in cluster
            assert "avg_age" in cluster

    @patch("pandas.read_sql")
    def test_cluster_labels_assigned(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_CLUSTERING_DF.copy()

        response = client.get("/predictions/clustering")
        data = response.json()

        labels = [c["label"] for c in data["clusters"]]
        valid_labels = {"VIP", "Loyal", "At Risk", "Casual"}
        for label in labels:
            assert label in valid_labels

    @patch("pandas.read_sql")
    def test_empty_database_returns_empty(self, mock_read_sql, client):
        mock_read_sql.return_value = pd.DataFrame()

        response = client.get("/predictions/clustering")

        assert response.status_code == 200
        data = response.json()
        assert data["predictions"] == []
        assert data["clusters"] == []


# --- Tests: Logistic Regression Predictions ---


class TestLogisticRegressionPredictions:
    @patch("pandas.read_sql")
    def test_returns_200_with_churn_predictions(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_LOGISTIC_DF.copy()

        response = client.get("/predictions/logistic-regression")

        assert response.status_code == 200
        data = response.json()
        assert "predictions" in data
        assert "summary" in data
        assert "total" in data

    @patch("pandas.read_sql")
    def test_summary_has_churn_metrics(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_LOGISTIC_DF.copy()

        response = client.get("/predictions/logistic-regression")
        data = response.json()

        summary = data["summary"]
        assert "total_customers" in summary
        assert "predicted_churn" in summary
        assert "churn_rate" in summary
        assert "avg_probability" in summary
        assert "high_risk_count" in summary
        assert "medium_risk_count" in summary
        assert "low_risk_count" in summary

    @patch("pandas.read_sql")
    def test_churn_rate_calculation(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_LOGISTIC_DF.copy()

        response = client.get("/predictions/logistic-regression")
        data = response.json()

        summary = data["summary"]
        assert summary["total_customers"] == 3
        assert summary["predicted_churn"] == 2
        assert 0 <= summary["churn_rate"] <= 1

    @patch("pandas.read_sql")
    def test_empty_database_returns_empty(self, mock_read_sql, client):
        mock_read_sql.return_value = pd.DataFrame()

        response = client.get("/predictions/logistic-regression")

        assert response.status_code == 200
        data = response.json()
        assert data["predictions"] == []
        assert data["summary"] == {}


# --- Tests: Model Comparison ---


class TestModelComparison:
    @patch("pandas.read_sql")
    def test_returns_200_with_comparison(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_COMPARE_DF.copy()

        response = client.get("/predictions/compare")

        assert response.status_code == 200
        data = response.json()
        assert "customers" in data
        assert "total" in data
        assert data["total"] == 2

    @patch("pandas.read_sql")
    def test_comparison_includes_all_model_fields(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_COMPARE_DF.copy()

        response = client.get("/predictions/compare")
        data = response.json()

        customer = data["customers"][0]
        assert "Cluster" in customer
        assert "DT_Label" in customer
        assert "DT_Confidence" in customer
        assert "Churn_Prediction" in customer
        assert "Churn_Probability" in customer
        assert "cluster_label" in customer

    @patch("pandas.read_sql")
    def test_empty_database_returns_empty(self, mock_read_sql, client):
        mock_read_sql.return_value = pd.DataFrame()

        response = client.get("/predictions/compare")

        assert response.status_code == 200
        data = response.json()
        assert data["customers"] == []
        assert data["models"] == []


# --- Tests: Model Metrics ---


class TestModelMetrics:
    @patch("pandas.read_sql")
    def test_returns_200_with_metrics(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_METRICS_DF.copy()

        response = client.get("/models/metrics")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3

    @patch("pandas.read_sql")
    def test_metrics_structure(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_METRICS_DF.copy()

        response = client.get("/models/metrics")
        data = response.json()

        metric = data[0]
        assert "model_name" in metric
        assert "accuracy" in metric
        assert "precision_score" in metric
        assert "recall" in metric
        assert "f1_score" in metric

    @patch("pandas.read_sql")
    def test_exception_returns_empty_list(self, mock_read_sql, client):
        mock_read_sql.side_effect = Exception("Table does not exist")

        response = client.get("/models/metrics")

        assert response.status_code == 200
        data = response.json()
        assert data == []


# --- Tests: Model Retrain (Admin Only) ---


class TestModelRetrain:
    @patch("ai_engine.ml_models.run_all_ml_tasks")
    def test_admin_can_retrain(self, mock_retrain, client):
        mock_retrain.return_value = None

        response = client.post("/models/retrain")

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "All models retrained successfully"
        mock_retrain.assert_called_once()

    @patch("ai_engine.ml_models.run_all_ml_tasks")
    def test_retrain_failure_returns_500(self, mock_retrain, client):
        mock_retrain.side_effect = Exception("Training failed")

        response = client.post("/models/retrain")

        assert response.status_code == 500
        assert "Training failed" in response.json()["detail"]

    def test_non_admin_cannot_retrain(self, non_admin_override, client):
        response = client.post("/models/retrain")

        assert response.status_code == 403


# --- Tests: MDX Analytics - Revenue by Segment ---


class TestMdxRevenueBySegment:
    @patch("pandas.read_sql")
    def test_returns_200_with_segments(self, mock_read_sql, client):
        df = SAMPLE_REVENUE_SEGMENT_DF.copy()
        mock_read_sql.return_value = df

        response = client.get("/analytics/mdx/revenue-by-segment")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3

    @patch("pandas.read_sql")
    def test_segment_structure(self, mock_read_sql, client):
        df = SAMPLE_REVENUE_SEGMENT_DF.copy()
        mock_read_sql.return_value = df

        response = client.get("/analytics/mdx/revenue-by-segment")
        data = response.json()

        segment = data[0]
        assert "segment_id" in segment
        assert "customer_count" in segment
        assert "order_count" in segment
        assert "total_revenue" in segment
        assert "avg_order_value" in segment
        assert "segment_name" in segment

    @patch("pandas.read_sql")
    def test_empty_returns_empty_list(self, mock_read_sql, client):
        mock_read_sql.return_value = pd.DataFrame(
            columns=[
                "segment_id",
                "customer_count",
                "order_count",
                "total_revenue",
                "avg_order_value",
            ]
        )

        response = client.get("/analytics/mdx/revenue-by-segment")

        assert response.status_code == 200
        data = response.json()
        assert data == []


# --- Tests: MDX Analytics - Churn by Demographics ---


class TestMdxChurnByDemographics:
    @patch("pandas.read_sql")
    def test_returns_200_with_demographics(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_CHURN_DEMOGRAPHICS_DF.copy()

        response = client.get("/analytics/mdx/churn-by-demographics")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 4

    @patch("pandas.read_sql")
    def test_demographics_structure(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_CHURN_DEMOGRAPHICS_DF.copy()

        response = client.get("/analytics/mdx/churn-by-demographics")
        data = response.json()

        record = data[0]
        assert "gender" in record
        assert "age_group" in record
        assert "total" in record
        assert "churned" in record
        assert "avg_churn_prob" in record


# --- Tests: MDX Analytics - Spending Distribution ---


class TestMdxSpendingDistribution:
    @patch("pandas.read_sql")
    def test_returns_200_with_distribution(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_SPENDING_DIST_DF.copy()

        response = client.get("/analytics/mdx/spending-distribution")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3

    @patch("pandas.read_sql")
    def test_distribution_structure(self, mock_read_sql, client):
        mock_read_sql.return_value = SAMPLE_SPENDING_DIST_DF.copy()

        response = client.get("/analytics/mdx/spending-distribution")
        data = response.json()

        record = data[0]
        assert "spending_category" in record
        assert "customer_count" in record
        assert "avg_income" in record
        assert "avg_spending" in record
        assert "avg_age" in record
        assert "avg_confidence" in record


# --- Tests: Authentication ---


class TestAuthentication:
    def test_decision_tree_requires_auth(self, no_auth_override, client):
        response = client.get("/predictions/decision-tree")
        assert response.status_code == 401

    def test_clustering_requires_auth(self, no_auth_override, client):
        response = client.get("/predictions/clustering")
        assert response.status_code == 401

    def test_logistic_regression_requires_auth(self, no_auth_override, client):
        response = client.get("/predictions/logistic-regression")
        assert response.status_code == 401

    def test_compare_requires_auth(self, no_auth_override, client):
        response = client.get("/predictions/compare")
        assert response.status_code == 401

    def test_model_metrics_requires_auth(self, no_auth_override, client):
        response = client.get("/models/metrics")
        assert response.status_code == 401

    def test_model_retrain_requires_auth(self, no_auth_override, client):
        response = client.post("/models/retrain")
        assert response.status_code == 401

    def test_revenue_by_segment_requires_auth(self, no_auth_override, client):
        response = client.get("/analytics/mdx/revenue-by-segment")
        assert response.status_code == 401

    def test_churn_by_demographics_requires_auth(self, no_auth_override, client):
        response = client.get("/analytics/mdx/churn-by-demographics")
        assert response.status_code == 401

    def test_spending_distribution_requires_auth(self, no_auth_override, client):
        response = client.get("/analytics/mdx/spending-distribution")
        assert response.status_code == 401
