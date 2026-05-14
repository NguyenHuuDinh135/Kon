"""Comprehensive unit tests for ai_engine.ml_models.

All database interactions are mocked to enable isolated testing
without a live PostgreSQL instance.

Uses the REAL schemas:
- customer_churn table: CustomerID, Gender, Tenure, CityTier, WarehouseToHome,
  HourSpendOnApp, NumberOfDeviceRegistered, PreferedOrderCat, SatisfactionScore,
  MaritalStatus, NumberOfAddress, Complain, OrderAmountHikeFromlastYear,
  CouponUsed, OrderCount, DaySinceLastOrder, CashbackAmount, Churn
- online_retail table: InvoiceNo, StockCode, Description, Quantity, InvoiceDate,
  UnitPrice, CustomerID, Country, TotalAmount
"""

import pytest
import pandas as pd
import numpy as np
from unittest.mock import patch, MagicMock
from datetime import datetime


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def online_retail_rfm_data():
    """Sample RFM data as returned by get_rfm_data query on online_retail."""
    np.random.seed(42)
    n = 60
    base_date = pd.Timestamp("2024-06-01")
    return pd.DataFrame(
        {
            "CustomerID": list(range(12000, 12000 + n)),
            "last_purchase": [
                base_date - pd.Timedelta(days=int(i * 3)) for i in range(n)
            ],
            "frequency": np.random.randint(1, 30, size=n).tolist(),
            "monetary": (np.random.uniform(50, 5000, size=n)).round(2).tolist(),
        }
    )


@pytest.fixture
def customer_churn_data():
    """Sample customer_churn DataFrame matching the real DB schema (50 rows)."""
    np.random.seed(42)
    n = 50
    return pd.DataFrame(
        {
            "CustomerID": list(range(1, n + 1)),
            "Gender": np.random.choice(["Male", "Female"], size=n).tolist(),
            "Tenure": np.random.randint(1, 60, size=n).tolist(),
            "CityTier": np.random.choice([1, 2, 3], size=n).tolist(),
            "WarehouseToHome": np.random.uniform(5, 40, size=n).round(1).tolist(),
            "HourSpendOnApp": np.random.uniform(0.5, 5.0, size=n).round(1).tolist(),
            "NumberOfDeviceRegistered": np.random.randint(1, 6, size=n).tolist(),
            "PreferedOrderCat": np.random.choice(
                ["Laptop & Accessory", "Mobile Phone", "Fashion", "Grocery", "Others"],
                size=n,
            ).tolist(),
            "SatisfactionScore": np.random.randint(1, 6, size=n).tolist(),
            "MaritalStatus": np.random.choice(
                ["Single", "Married", "Divorced"], size=n
            ).tolist(),
            "NumberOfAddress": np.random.randint(1, 10, size=n).tolist(),
            "Complain": np.random.choice([0, 1], size=n).tolist(),
            "OrderAmountHikeFromlastYear": np.random.uniform(11, 26, size=n)
            .round(1)
            .tolist(),
            "CouponUsed": np.random.uniform(0, 15, size=n).round(1).tolist(),
            "OrderCount": np.random.randint(1, 16, size=n).astype(float).tolist(),
            "DaySinceLastOrder": np.random.uniform(0, 30, size=n).round(1).tolist(),
            "CashbackAmount": np.random.uniform(50, 350, size=n).round(2).tolist(),
            "Churn": np.random.choice([0, 1], size=n, p=[0.7, 0.3]).tolist(),
            "PreferredLoginDevice": np.random.choice(
                ["Mobile Phone", "Computer", "Phone"], size=n
            ).tolist(),
            "PreferredPaymentMode": np.random.choice(
                ["Debit Card", "Credit Card", "UPI", "Cash on Delivery"], size=n
            ).tolist(),
        }
    )


@pytest.fixture
def small_churn_data():
    """customer_churn with fewer than 10 rows (insufficient for training)."""
    return pd.DataFrame(
        {
            "CustomerID": [1, 2, 3, 4, 5],
            "Gender": ["Male", "Female", "Male", "Female", "Male"],
            "Tenure": [5, 10, 15, 20, 25],
            "CityTier": [1, 2, 3, 1, 2],
            "WarehouseToHome": [10.0, 15.0, 20.0, 25.0, 30.0],
            "HourSpendOnApp": [2.0, 3.0, 1.0, 4.0, 2.5],
            "NumberOfDeviceRegistered": [2, 3, 1, 4, 2],
            "PreferedOrderCat": ["Laptop & Accessory"] * 5,
            "SatisfactionScore": [3, 4, 2, 5, 3],
            "MaritalStatus": ["Single", "Married", "Single", "Divorced", "Married"],
            "NumberOfAddress": [2, 3, 1, 4, 2],
            "Complain": [0, 1, 0, 0, 1],
            "OrderAmountHikeFromlastYear": [15.0, 12.0, 18.0, 11.0, 20.0],
            "CouponUsed": [2.0, 5.0, 1.0, 3.0, 4.0],
            "OrderCount": [3.0, 5.0, 2.0, 7.0, 4.0],
            "DaySinceLastOrder": [5.0, 10.0, 3.0, 15.0, 7.0],
            "CashbackAmount": [150.0, 200.0, 100.0, 250.0, 180.0],
            "Churn": [0, 1, 0, 1, 0],
            "PreferredLoginDevice": ["Mobile Phone"] * 5,
            "PreferredPaymentMode": ["Debit Card"] * 5,
        }
    )


@pytest.fixture
def mock_engine_connect():
    """Mock the engine.connect() context manager to prevent real DB writes."""
    mock_conn = MagicMock()
    mock_conn.__enter__ = MagicMock(return_value=mock_conn)
    mock_conn.__exit__ = MagicMock(return_value=False)
    mock_conn.execute = MagicMock(return_value=MagicMock(scalar=MagicMock(return_value=0)))
    mock_conn.commit = MagicMock()
    return mock_conn


# ---------------------------------------------------------------------------
# Tests: get_rfm_data
# ---------------------------------------------------------------------------


class TestGetRfmData:
    """Tests for the get_rfm_data helper function."""

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_returns_dataframe_with_recency(
        self, mock_read_sql, mock_engine, online_retail_rfm_data
    ):
        mock_read_sql.return_value = online_retail_rfm_data

        from ai_engine.ml_models import get_rfm_data

        result = get_rfm_data()

        assert not result.empty
        assert "recency" in result.columns
        assert "CustomerID" in result.columns
        assert "frequency" in result.columns
        assert "monetary" in result.columns
        assert (result["recency"] >= 0).all()

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_empty_result(self, mock_read_sql, mock_engine):
        mock_read_sql.return_value = pd.DataFrame()

        from ai_engine.ml_models import get_rfm_data

        result = get_rfm_data()

        assert result.empty


# ---------------------------------------------------------------------------
# Tests: train_customer_segments (K-Means)
# ---------------------------------------------------------------------------


class TestTrainCustomerSegments:
    """Tests for K-Means clustering on RFM from online_retail (k=5)."""

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_returns_5_clusters(
        self, mock_read_sql, mock_engine, online_retail_rfm_data, mock_engine_connect
    ):
        mock_read_sql.return_value = online_retail_rfm_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_customer_segments

        df_result, metrics = train_customer_segments()

        assert df_result is not None
        assert "cluster" in df_result.columns
        unique_clusters = df_result["cluster"].nunique()
        assert unique_clusters == 5

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_valid_silhouette_score(
        self, mock_read_sql, mock_engine, online_retail_rfm_data, mock_engine_connect
    ):
        mock_read_sql.return_value = online_retail_rfm_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_customer_segments

        _, metrics = train_customer_segments()

        assert "silhouette_score" in metrics
        assert -1.0 <= metrics["silhouette_score"] <= 1.0

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_metrics_structure(
        self, mock_read_sql, mock_engine, online_retail_rfm_data, mock_engine_connect
    ):
        mock_read_sql.return_value = online_retail_rfm_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_customer_segments

        _, metrics = train_customer_segments()

        assert metrics["model_name"] == "KMeans Clustering"
        assert metrics["n_clusters"] == 5
        assert "inertia" in metrics
        assert "cluster_centers" in metrics
        assert "cluster_sizes" in metrics
        assert "features" in metrics
        assert metrics["features"] == ["recency", "frequency", "monetary"]
        assert "n_customers" in metrics
        assert "trained_at" in metrics
        assert "silhouette_scores" in metrics
        assert "best_k_by_silhouette" in metrics

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_cluster_labels_assigned(
        self, mock_read_sql, mock_engine, online_retail_rfm_data, mock_engine_connect
    ):
        mock_read_sql.return_value = online_retail_rfm_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_customer_segments

        df_result, _ = train_customer_segments()

        assert "cluster_label" in df_result.columns
        valid_labels = {"VIP", "Loyal", "At Risk", "Casual", "New"}
        assert set(df_result["cluster_label"].unique()).issubset(valid_labels)

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_empty_data_returns_none(self, mock_read_sql, mock_engine):
        mock_read_sql.return_value = pd.DataFrame()

        from ai_engine.ml_models import train_customer_segments

        result, metrics = train_customer_segments()

        assert result is None
        assert metrics == {}

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_null_features_handled(
        self, mock_read_sql, mock_engine, mock_engine_connect
    ):
        """Data where RFM features are all NaN should return None."""
        base_date = pd.Timestamp("2024-06-01")
        df = pd.DataFrame(
            {
                "CustomerID": range(1, 11),
                "last_purchase": [base_date] * 10,
                "frequency": [np.nan] * 10,
                "monetary": [np.nan] * 10,
            }
        )
        mock_read_sql.return_value = df
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_customer_segments

        result, metrics = train_customer_segments()

        assert result is None
        assert metrics == {}

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_db_write_called(
        self, mock_read_sql, mock_engine, online_retail_rfm_data, mock_engine_connect
    ):
        """Verify cluster assignments are written back to DB."""
        mock_read_sql.return_value = online_retail_rfm_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_customer_segments

        train_customer_segments()

        mock_engine_connect.commit.assert_called()
        assert mock_engine_connect.execute.call_count > 0


# ---------------------------------------------------------------------------
# Tests: train_decision_tree
# ---------------------------------------------------------------------------


class TestTrainDecisionTree:
    """Tests for Decision Tree classifier on customer_churn engagement level."""

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_predictions_have_dt_label_name(
        self, mock_read_sql, mock_engine, customer_churn_data, mock_engine_connect
    ):
        mock_read_sql.return_value = customer_churn_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_decision_tree

        df_result, metrics = train_decision_tree()

        assert df_result is not None
        assert "dt_label_name" in df_result.columns
        valid_categories = {"Low", "Medium", "High", "VIP"}
        predictions = set(df_result["dt_label_name"].unique())
        assert predictions.issubset(valid_categories)

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_predictions_have_dt_confidence(
        self, mock_read_sql, mock_engine, customer_churn_data, mock_engine_connect
    ):
        mock_read_sql.return_value = customer_churn_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_decision_tree

        df_result, _ = train_decision_tree()

        assert "dt_confidence" in df_result.columns
        assert (df_result["dt_confidence"] >= 0).all()
        assert (df_result["dt_confidence"] <= 1).all()

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_accuracy_greater_than_zero(
        self, mock_read_sql, mock_engine, customer_churn_data, mock_engine_connect
    ):
        mock_read_sql.return_value = customer_churn_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_decision_tree

        _, metrics = train_decision_tree()

        assert metrics["accuracy"] > 0

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_metrics_structure(
        self, mock_read_sql, mock_engine, customer_churn_data, mock_engine_connect
    ):
        mock_read_sql.return_value = customer_churn_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_decision_tree

        _, metrics = train_decision_tree()

        assert metrics["model_name"] == "Decision Tree"
        assert "accuracy" in metrics
        assert "precision" in metrics
        assert "recall" in metrics
        assert "f1_score" in metrics
        assert "feature_importance" in metrics
        assert "classes" in metrics
        assert metrics["classes"] == ["Low", "Medium", "High", "VIP"]
        assert "best_params" in metrics
        assert "cv_scores_mean" in metrics
        assert "cv_scores_std" in metrics
        assert "confusion_matrix" in metrics
        assert "classification_report" in metrics
        assert "max_depth" in metrics
        assert "train_size" in metrics
        assert "test_size" in metrics
        assert "trained_at" in metrics

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_feature_importance_keys(
        self, mock_read_sql, mock_engine, customer_churn_data, mock_engine_connect
    ):
        mock_read_sql.return_value = customer_churn_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_decision_tree

        _, metrics = train_decision_tree()

        expected_features = {
            "Tenure",
            "SatisfactionScore",
            "NumberOfDeviceRegistered",
            "WarehouseToHome",
            "NumberOfAddress",
            "CashbackAmount",
        }
        assert set(metrics["feature_importance"].keys()) == expected_features
        total_importance = sum(metrics["feature_importance"].values())
        assert abs(total_importance - 1.0) < 1e-6

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_empty_data_returns_none(self, mock_read_sql, mock_engine):
        mock_read_sql.return_value = pd.DataFrame()

        from ai_engine.ml_models import train_decision_tree

        result, metrics = train_decision_tree()

        assert result is None
        assert metrics == {}

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_insufficient_data_returns_none(
        self, mock_read_sql, mock_engine, small_churn_data
    ):
        """Fewer than 10 rows should return None."""
        mock_read_sql.return_value = small_churn_data

        from ai_engine.ml_models import train_decision_tree

        result, metrics = train_decision_tree()

        assert result is None
        assert metrics == {}


# ---------------------------------------------------------------------------
# Tests: train_logistic_regression
# ---------------------------------------------------------------------------


class TestTrainLogisticRegression:
    """Tests for Logistic Regression churn prediction using real Churn labels."""

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_binary_predictions(
        self, mock_read_sql, mock_engine, customer_churn_data, mock_engine_connect
    ):
        mock_read_sql.return_value = customer_churn_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression

        df_result, metrics = train_logistic_regression()

        assert df_result is not None
        predictions = set(df_result["churn_prediction"].unique())
        assert predictions.issubset({0, 1})

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_probability_between_0_and_1(
        self, mock_read_sql, mock_engine, customer_churn_data, mock_engine_connect
    ):
        mock_read_sql.return_value = customer_churn_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression

        df_result, _ = train_logistic_regression()

        assert (df_result["churn_probability"] >= 0).all()
        assert (df_result["churn_probability"] <= 1).all()

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_metrics_structure(
        self, mock_read_sql, mock_engine, customer_churn_data, mock_engine_connect
    ):
        mock_read_sql.return_value = customer_churn_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression

        _, metrics = train_logistic_regression()

        assert metrics["model_name"] == "Logistic Regression"
        assert "accuracy" in metrics
        assert "precision" in metrics
        assert "recall" in metrics
        assert "f1_score" in metrics
        assert "roc_auc" in metrics
        assert "roc_curve" in metrics
        assert "top_coefficients" in metrics
        assert "intercept" in metrics
        assert "churn_rate" in metrics
        assert "n_features" in metrics
        assert "cv_scores_mean" in metrics
        assert "cv_scores_std" in metrics
        assert "confusion_matrix" in metrics
        assert "classification_report" in metrics
        assert "train_size" in metrics
        assert "test_size" in metrics
        assert "trained_at" in metrics

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_top_coefficients_has_max_10_entries(
        self, mock_read_sql, mock_engine, customer_churn_data, mock_engine_connect
    ):
        mock_read_sql.return_value = customer_churn_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression

        _, metrics = train_logistic_regression()

        assert len(metrics["top_coefficients"]) <= 10

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_accuracy_greater_than_zero(
        self, mock_read_sql, mock_engine, customer_churn_data, mock_engine_connect
    ):
        mock_read_sql.return_value = customer_churn_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression

        _, metrics = train_logistic_regression()

        assert metrics["accuracy"] > 0

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_churn_rate_valid(
        self, mock_read_sql, mock_engine, customer_churn_data, mock_engine_connect
    ):
        mock_read_sql.return_value = customer_churn_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression

        _, metrics = train_logistic_regression()

        assert 0.0 <= metrics["churn_rate"] <= 1.0

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_roc_auc_valid(
        self, mock_read_sql, mock_engine, customer_churn_data, mock_engine_connect
    ):
        mock_read_sql.return_value = customer_churn_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression

        _, metrics = train_logistic_regression()

        assert 0.0 <= metrics["roc_auc"] <= 1.0
        assert "fpr" in metrics["roc_curve"]
        assert "tpr" in metrics["roc_curve"]
        assert "auc" in metrics["roc_curve"]

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_empty_data_returns_none(self, mock_read_sql, mock_engine):
        mock_read_sql.return_value = pd.DataFrame()

        from ai_engine.ml_models import train_logistic_regression

        result, metrics = train_logistic_regression()

        assert result is None
        assert metrics == {}

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_insufficient_data_returns_none(
        self, mock_read_sql, mock_engine, small_churn_data
    ):
        mock_read_sql.return_value = small_churn_data

        from ai_engine.ml_models import train_logistic_regression

        result, metrics = train_logistic_regression()

        assert result is None
        assert metrics == {}


# ---------------------------------------------------------------------------
# Tests: train_revenue_forecast
# ---------------------------------------------------------------------------


class TestTrainRevenueForecast:
    """Tests for linear regression revenue forecast."""

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_returns_forecast_for_3_months(self, mock_read_sql, mock_engine):
        df = pd.DataFrame(
            {
                "month": pd.to_datetime(
                    ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05"]
                ),
                "revenue": [10000.0, 12000.0, 11500.0, 13000.0, 14000.0],
            }
        )
        mock_read_sql.return_value = df

        from ai_engine.ml_models import train_revenue_forecast

        result, metrics = train_revenue_forecast()

        assert result is not None
        assert "forecast_next_3_months" in metrics
        assert len(metrics["forecast_next_3_months"]) == 3

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_metrics_structure(self, mock_read_sql, mock_engine):
        df = pd.DataFrame(
            {
                "month": pd.to_datetime(
                    ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05"]
                ),
                "revenue": [10000.0, 12000.0, 11500.0, 13000.0, 14000.0],
            }
        )
        mock_read_sql.return_value = df

        from ai_engine.ml_models import train_revenue_forecast

        _, metrics = train_revenue_forecast()

        assert metrics["model_name"] == "Revenue Forecast"
        assert "r_squared" in metrics
        assert "slope" in metrics
        assert "intercept" in metrics
        assert "n_months" in metrics
        assert "avg_monthly_revenue" in metrics
        assert "trained_at" in metrics

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_insufficient_data_returns_none(self, mock_read_sql, mock_engine):
        """Less than 4 months of data should return None."""
        df = pd.DataFrame(
            {
                "month": pd.to_datetime(["2024-01", "2024-02"]),
                "revenue": [10000.0, 12000.0],
            }
        )
        mock_read_sql.return_value = df

        from ai_engine.ml_models import train_revenue_forecast

        result, metrics = train_revenue_forecast()

        assert result is None
        assert metrics == {}

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_empty_data_returns_none(self, mock_read_sql, mock_engine):
        mock_read_sql.return_value = pd.DataFrame()

        from ai_engine.ml_models import train_revenue_forecast

        result, metrics = train_revenue_forecast()

        assert result is None
        assert metrics == {}


# ---------------------------------------------------------------------------
# Tests: generate_recommendations
# ---------------------------------------------------------------------------


class TestGenerateRecommendations:
    """Tests for product recommendation generation from Olist order data."""

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_returns_list_of_dicts(self, mock_read_sql, mock_engine):
        # First call: order_items query
        order_items_df = pd.DataFrame(
            {
                "order_id": ["O1", "O1", "O2", "O2", "O3"] * 10,
                "product_id": [f"P{i}" for i in range(50)],
                "price": [10.0] * 50,
            }
        )
        # Second call: customer query
        cust_df = pd.DataFrame(
            {
                "customer_id": [f"C{i}" for i in range(1, 21)] * 2,
                "product_id": [f"P{i % 5}" for i in range(40)],
            }
        )

        mock_read_sql.side_effect = [order_items_df, cust_df]

        from ai_engine.ml_models import generate_recommendations

        result = generate_recommendations()

        assert isinstance(result, list)
        assert len(result) > 0

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_recommendation_structure(self, mock_read_sql, mock_engine):
        order_items_df = pd.DataFrame(
            {
                "order_id": ["O1", "O1", "O2", "O2", "O3"] * 10,
                "product_id": [f"P{i}" for i in range(50)],
                "price": [10.0] * 50,
            }
        )
        cust_df = pd.DataFrame(
            {
                "customer_id": [f"C{i}" for i in range(1, 11)] * 3,
                "product_id": [f"P{i % 3}" for i in range(30)],
            }
        )

        mock_read_sql.side_effect = [order_items_df, cust_df]

        from ai_engine.ml_models import generate_recommendations

        result = generate_recommendations()

        for rec in result:
            assert "CustomerID" in rec
            assert "RecommendedProducts" in rec
            assert "Score" in rec
            assert isinstance(rec["RecommendedProducts"], list)
            assert len(rec["RecommendedProducts"]) <= 3
            assert rec["Score"] == 0.85

    @patch("ai_engine.ml_models.engine")
    @patch("ai_engine.ml_models.pd.read_sql")
    def test_empty_orders_returns_empty_list(self, mock_read_sql, mock_engine):
        mock_read_sql.return_value = pd.DataFrame(
            columns=["order_id", "product_id", "price"]
        )

        from ai_engine.ml_models import generate_recommendations

        result = generate_recommendations()

        assert result == []


# ---------------------------------------------------------------------------
# Tests: save_model_metrics
# ---------------------------------------------------------------------------


class TestSaveModelMetrics:
    """Tests for saving metrics to the database."""

    @patch("ai_engine.ml_models.engine")
    def test_save_metrics_executes_sql(self, mock_engine, mock_engine_connect):
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import save_model_metrics

        metrics = {
            "model_name": "Test Model",
            "accuracy": 0.95,
            "precision": 0.93,
            "recall": 0.91,
            "f1_score": 0.92,
        }
        save_model_metrics(metrics)

        # Should execute CREATE TABLE, SELECT count, and INSERT
        assert mock_engine_connect.execute.call_count == 3
        mock_engine_connect.commit.assert_called_once()

    @patch("ai_engine.ml_models.engine")
    def test_save_metrics_includes_version(self, mock_engine, mock_engine_connect):
        """Verify version tracking is added to metrics dict."""
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import save_model_metrics

        metrics = {
            "model_name": "KMeans Clustering",
            "accuracy": None,
            "precision": None,
            "recall": None,
            "f1_score": None,
            "silhouette_score": 0.45,
        }
        save_model_metrics(metrics)

        # After saving, version should have been set
        assert "version" in metrics
        assert metrics["version"] == 1
