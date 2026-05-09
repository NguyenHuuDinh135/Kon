"""Comprehensive unit tests for ai_engine.ml_models.

All database interactions are mocked to enable isolated testing
without a live PostgreSQL instance.
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
def behavior_data():
    """Sample customer behavior data matching the DB schema."""
    return pd.DataFrame({
        'CustomerID': range(1, 51),
        'Gender': ['Male', 'Female'] * 25,
        'Age': [20 + i % 40 for i in range(50)],
        'income': [15 + i * 1.5 for i in range(50)],
        'spending_score': [10 + i * 1.8 for i in range(50)],
    })


@pytest.fixture
def small_behavior_data():
    """Behavior data with fewer than 10 rows (insufficient for training)."""
    return pd.DataFrame({
        'CustomerID': range(1, 6),
        'Gender': ['Male', 'Female', 'Male', 'Female', 'Male'],
        'Age': [25, 30, 35, 40, 45],
        'income': [20.0, 30.0, 40.0, 50.0, 60.0],
        'spending_score': [15.0, 25.0, 35.0, 45.0, 55.0],
    })


@pytest.fixture
def empty_dataframe():
    """Empty DataFrame with the expected columns."""
    return pd.DataFrame(columns=['CustomerID', 'Gender', 'Age', 'income', 'spending_score'])


@pytest.fixture
def rfm_data():
    """Sample RFM data as returned from the orders table."""
    base_date = pd.Timestamp('2024-01-01')
    return pd.DataFrame({
        'customerID': [f'CUST{i:03d}' for i in range(1, 21)],
        'last_order': [base_date - pd.Timedelta(days=i * 5) for i in range(20)],
        'frequency': [i + 1 for i in range(20)],
        'monetary': [100.0 + i * 50.0 for i in range(20)],
    })


@pytest.fixture
def order_details_data():
    """Sample order_details for generate_recommendations."""
    return pd.DataFrame({
        'orderID': [1, 1, 2, 2, 3, 3, 4, 4, 5, 5] * 5,
        'productID': list(range(1, 51)),
    })


@pytest.fixture
def products_data():
    """Sample products lookup table."""
    return pd.DataFrame({
        'productID': range(1, 51),
        'productName': [f'Product {i}' for i in range(1, 51)],
    })


@pytest.fixture
def customer_orders_data():
    """Sample join of orders and order_details per customer."""
    customers = [f'CUST{i:03d}' for i in range(1, 11)]
    rows = []
    for cust in customers:
        # Each customer bought 3 products
        for pid in np.random.default_rng(42).choice(range(1, 51), size=3, replace=False):
            rows.append({'customerID': cust, 'productID': int(pid)})
    return pd.DataFrame(rows)


@pytest.fixture
def mock_engine_connect():
    """Mock the engine.connect() context manager to prevent real DB writes."""
    mock_conn = MagicMock()
    mock_conn.__enter__ = MagicMock(return_value=mock_conn)
    mock_conn.__exit__ = MagicMock(return_value=False)
    mock_conn.execute = MagicMock()
    mock_conn.commit = MagicMock()
    return mock_conn


# ---------------------------------------------------------------------------
# Tests: get_rfm_data
# ---------------------------------------------------------------------------


class TestGetRfmData:
    """Tests for the get_rfm_data helper function."""

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_returns_dataframe_with_recency(self, mock_read_sql, mock_engine, rfm_data):
        mock_read_sql.return_value = rfm_data

        from ai_engine.ml_models import get_rfm_data
        result = get_rfm_data()

        assert not result.empty
        assert 'recency' in result.columns
        assert 'customerID' in result.columns
        assert 'frequency' in result.columns
        assert 'monetary' in result.columns
        # Recency should be non-negative integers (days)
        assert (result['recency'] >= 0).all()

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_empty_result(self, mock_read_sql, mock_engine):
        mock_read_sql.return_value = pd.DataFrame()

        from ai_engine.ml_models import get_rfm_data
        result = get_rfm_data()

        assert result.empty


# ---------------------------------------------------------------------------
# Tests: get_behavior_data
# ---------------------------------------------------------------------------


class TestGetBehaviorData:
    """Tests for the get_behavior_data helper function."""

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_returns_expected_columns(self, mock_read_sql, mock_engine, behavior_data):
        mock_read_sql.return_value = behavior_data

        from ai_engine.ml_models import get_behavior_data
        result = get_behavior_data()

        expected_cols = {'CustomerID', 'Gender', 'Age', 'income', 'spending_score'}
        assert expected_cols.issubset(set(result.columns))
        assert len(result) == 50

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_empty_table(self, mock_read_sql, mock_engine, empty_dataframe):
        mock_read_sql.return_value = empty_dataframe

        from ai_engine.ml_models import get_behavior_data
        result = get_behavior_data()

        assert result.empty


# ---------------------------------------------------------------------------
# Tests: train_customer_segments (K-Means)
# ---------------------------------------------------------------------------


class TestTrainCustomerSegments:
    """Tests for K-Means clustering training."""

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_returns_4_clusters(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_customer_segments
        df_result, metrics = train_customer_segments()

        assert df_result is not None
        assert 'cluster' in df_result.columns
        unique_clusters = df_result['cluster'].nunique()
        assert unique_clusters == 4

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_valid_silhouette_score(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_customer_segments
        _, metrics = train_customer_segments()

        assert 'silhouette_score' in metrics
        # Silhouette score ranges from -1 to 1
        assert -1.0 <= metrics['silhouette_score'] <= 1.0

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_metrics_structure(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_customer_segments
        _, metrics = train_customer_segments()

        assert metrics['model_name'] == 'KMeans Clustering'
        assert metrics['n_clusters'] == 4
        assert 'inertia' in metrics
        assert 'cluster_centers' in metrics
        assert 'cluster_sizes' in metrics
        assert 'trained_at' in metrics

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_cluster_labels_assigned(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_customer_segments
        df_result, _ = train_customer_segments()

        assert 'cluster_label' in df_result.columns
        valid_labels = {'VIP', 'Loyal', 'At Risk', 'Casual'}
        assert set(df_result['cluster_label'].unique()).issubset(valid_labels)

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_empty_data_returns_none(self, mock_read_sql, mock_engine, empty_dataframe):
        mock_read_sql.return_value = empty_dataframe

        from ai_engine.ml_models import train_customer_segments
        result, metrics = train_customer_segments()

        assert result is None
        assert metrics == {}

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_null_features_handled(self, mock_read_sql, mock_engine, mock_engine_connect):
        """Data where income and spending_score are all NaN should return None."""
        df = pd.DataFrame({
            'CustomerID': range(1, 11),
            'Gender': ['Male'] * 10,
            'Age': [30] * 10,
            'income': [np.nan] * 10,
            'spending_score': [np.nan] * 10,
        })
        mock_read_sql.return_value = df
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_customer_segments
        result, metrics = train_customer_segments()

        assert result is None
        assert metrics == {}

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_db_write_called(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        """Verify that cluster assignments are written back to the DB."""
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_customer_segments
        train_customer_segments()

        # Commit should have been called
        mock_engine_connect.commit.assert_called()
        # Execute should have been called for each row update
        assert mock_engine_connect.execute.call_count > 0


# ---------------------------------------------------------------------------
# Tests: train_decision_tree
# ---------------------------------------------------------------------------


class TestTrainDecisionTree:
    """Tests for Decision Tree classifier training."""

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_predictions_in_valid_categories(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_decision_tree
        df_result, metrics = train_decision_tree()

        valid_categories = {'Low', 'Medium', 'High', 'VIP'}
        predictions = set(df_result['dt_prediction'].unique())
        assert predictions.issubset(valid_categories)

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_accuracy_greater_than_zero(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_decision_tree
        _, metrics = train_decision_tree()

        assert metrics['accuracy'] > 0

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_metrics_structure(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_decision_tree
        _, metrics = train_decision_tree()

        assert metrics['model_name'] == 'Decision Tree'
        assert 'accuracy' in metrics
        assert 'precision' in metrics
        assert 'recall' in metrics
        assert 'f1_score' in metrics
        assert 'feature_importance' in metrics
        assert 'classes' in metrics
        assert metrics['classes'] == ['Low', 'Medium', 'High', 'VIP']
        assert metrics['max_depth'] == 5
        assert 'train_size' in metrics
        assert 'test_size' in metrics
        assert 'trained_at' in metrics

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_confidence_between_0_and_1(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_decision_tree
        df_result, _ = train_decision_tree()

        assert (df_result['dt_confidence'] >= 0).all()
        assert (df_result['dt_confidence'] <= 1).all()

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_empty_data_returns_none(self, mock_read_sql, mock_engine, empty_dataframe):
        mock_read_sql.return_value = empty_dataframe

        from ai_engine.ml_models import train_decision_tree
        result, metrics = train_decision_tree()

        assert result is None
        assert metrics == {}

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_insufficient_data_returns_none(self, mock_read_sql, mock_engine, small_behavior_data):
        """Fewer than 10 rows should return None."""
        mock_read_sql.return_value = small_behavior_data

        from ai_engine.ml_models import train_decision_tree
        result, metrics = train_decision_tree()

        assert result is None
        assert metrics == {}

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_feature_importance_keys(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_decision_tree
        _, metrics = train_decision_tree()

        expected_features = {'Age', 'income', 'gender_encoded'}
        assert set(metrics['feature_importance'].keys()) == expected_features
        # All importance values should sum approximately to 1
        total_importance = sum(metrics['feature_importance'].values())
        assert abs(total_importance - 1.0) < 1e-6

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_db_write_called(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_decision_tree
        train_decision_tree()

        mock_engine_connect.commit.assert_called()
        assert mock_engine_connect.execute.call_count > 0


# ---------------------------------------------------------------------------
# Tests: train_logistic_regression
# ---------------------------------------------------------------------------


class TestTrainLogisticRegression:
    """Tests for Logistic Regression churn prediction."""

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_binary_predictions(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression
        df_result, metrics = train_logistic_regression()

        predictions = set(df_result['churn_prediction'].unique())
        assert predictions.issubset({0, 1})

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_probability_between_0_and_1(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression
        df_result, _ = train_logistic_regression()

        assert (df_result['churn_probability'] >= 0).all()
        assert (df_result['churn_probability'] <= 1).all()

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_metrics_structure(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression
        _, metrics = train_logistic_regression()

        assert metrics['model_name'] == 'Logistic Regression'
        assert 'accuracy' in metrics
        assert 'precision' in metrics
        assert 'recall' in metrics
        assert 'f1_score' in metrics
        assert 'coefficients' in metrics
        assert 'intercept' in metrics
        assert 'churn_rate' in metrics
        assert 'train_size' in metrics
        assert 'test_size' in metrics
        assert 'trained_at' in metrics

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_accuracy_greater_than_zero(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression
        _, metrics = train_logistic_regression()

        assert metrics['accuracy'] > 0

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_churn_rate_valid(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression
        _, metrics = train_logistic_regression()

        assert 0.0 <= metrics['churn_rate'] <= 1.0

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_coefficients_keys(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression
        _, metrics = train_logistic_regression()

        expected_features = {'Age', 'income', 'gender_encoded'}
        assert set(metrics['coefficients'].keys()) == expected_features

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_empty_data_returns_none(self, mock_read_sql, mock_engine, empty_dataframe):
        mock_read_sql.return_value = empty_dataframe

        from ai_engine.ml_models import train_logistic_regression
        result, metrics = train_logistic_regression()

        assert result is None
        assert metrics == {}

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_insufficient_data_returns_none(self, mock_read_sql, mock_engine, small_behavior_data):
        mock_read_sql.return_value = small_behavior_data

        from ai_engine.ml_models import train_logistic_regression
        result, metrics = train_logistic_regression()

        assert result is None
        assert metrics == {}

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_db_write_called(self, mock_read_sql, mock_engine, behavior_data, mock_engine_connect):
        mock_read_sql.return_value = behavior_data
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression
        train_logistic_regression()

        mock_engine_connect.commit.assert_called()
        assert mock_engine_connect.execute.call_count > 0


# ---------------------------------------------------------------------------
# Tests: generate_recommendations
# ---------------------------------------------------------------------------


class TestGenerateRecommendations:
    """Tests for product recommendation generation."""

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_returns_list_of_dicts(self, mock_read_sql, mock_engine,
                                   order_details_data, products_data, customer_orders_data):
        def side_effect(query, eng):
            if 'order_details' in query and 'orders' not in query:
                return order_details_data
            elif 'products' in query:
                return products_data
            else:
                return customer_orders_data

        mock_read_sql.side_effect = side_effect

        from ai_engine.ml_models import generate_recommendations
        result = generate_recommendations()

        assert isinstance(result, list)
        assert len(result) > 0

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_recommendation_structure(self, mock_read_sql, mock_engine,
                                      order_details_data, products_data, customer_orders_data):
        def side_effect(query, eng):
            if 'order_details' in query and 'orders' not in query:
                return order_details_data
            elif 'products' in query:
                return products_data
            else:
                return customer_orders_data

        mock_read_sql.side_effect = side_effect

        from ai_engine.ml_models import generate_recommendations
        result = generate_recommendations()

        for rec in result:
            assert 'CustomerID' in rec
            assert 'RecommendedProducts' in rec
            assert 'Score' in rec
            assert isinstance(rec['RecommendedProducts'], list)
            assert len(rec['RecommendedProducts']) <= 3
            assert rec['Score'] == 0.85

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_recommended_products_are_strings(self, mock_read_sql, mock_engine,
                                              order_details_data, products_data, customer_orders_data):
        def side_effect(query, eng):
            if 'order_details' in query and 'orders' not in query:
                return order_details_data
            elif 'products' in query:
                return products_data
            else:
                return customer_orders_data

        mock_read_sql.side_effect = side_effect

        from ai_engine.ml_models import generate_recommendations
        result = generate_recommendations()

        for rec in result:
            for product in rec['RecommendedProducts']:
                assert isinstance(product, str)

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_empty_orders_returns_empty_list(self, mock_read_sql, mock_engine):
        mock_read_sql.return_value = pd.DataFrame(columns=['orderID', 'productID'])

        from ai_engine.ml_models import generate_recommendations
        result = generate_recommendations()

        assert result == []

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_no_duplicate_customer_recommendations(self, mock_read_sql, mock_engine,
                                                   order_details_data, products_data, customer_orders_data):
        def side_effect(query, eng):
            if 'order_details' in query and 'orders' not in query:
                return order_details_data
            elif 'products' in query:
                return products_data
            else:
                return customer_orders_data

        mock_read_sql.side_effect = side_effect

        from ai_engine.ml_models import generate_recommendations
        result = generate_recommendations()

        customer_ids = [rec['CustomerID'] for rec in result]
        assert len(customer_ids) == len(set(customer_ids))

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_does_not_recommend_already_bought(self, mock_read_sql, mock_engine):
        """Ensure recommendations exclude products the customer already purchased."""
        order_details = pd.DataFrame({
            'orderID': [1, 1, 2, 2, 3],
            'productID': [1, 2, 3, 4, 5],
        })
        products = pd.DataFrame({
            'productID': [1, 2, 3, 4, 5],
            'productName': ['A', 'B', 'C', 'D', 'E'],
        })
        # Single customer bought products 1, 2, 3
        cust_orders = pd.DataFrame({
            'customerID': ['CUST1', 'CUST1', 'CUST1'],
            'productID': [1, 2, 3],
        })

        def side_effect(query, eng):
            if 'order_details' in query and 'orders' not in query:
                return order_details
            elif 'products' in query:
                return products
            else:
                return cust_orders

        mock_read_sql.side_effect = side_effect

        from ai_engine.ml_models import generate_recommendations
        result = generate_recommendations()

        if result:
            rec = result[0]
            bought_names = {'A', 'B', 'C'}
            for product_name in rec['RecommendedProducts']:
                assert product_name not in bought_names


# ---------------------------------------------------------------------------
# Tests: Edge Cases
# ---------------------------------------------------------------------------


class TestEdgeCases:
    """Edge case tests across all ML functions."""

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_segments_with_nan_in_non_feature_cols(self, mock_read_sql, mock_engine, mock_engine_connect):
        """NaN in non-feature columns should not break clustering."""
        df = pd.DataFrame({
            'CustomerID': range(1, 31),
            'Gender': [None] * 30,
            'Age': [None] * 30,
            'income': [15 + i * 2.0 for i in range(30)],
            'spending_score': [10 + i * 3.0 for i in range(30)],
        })
        mock_read_sql.return_value = df
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_customer_segments
        result, metrics = train_customer_segments()

        assert result is not None
        assert metrics['n_clusters'] == 4

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_decision_tree_with_single_gender(self, mock_read_sql, mock_engine, mock_engine_connect):
        """All same gender should still work (label encoder handles it)."""
        df = pd.DataFrame({
            'CustomerID': range(1, 51),
            'Gender': ['Female'] * 50,
            'Age': [20 + i % 40 for i in range(50)],
            'income': [15 + i * 1.5 for i in range(50)],
            'spending_score': [10 + i * 1.8 for i in range(50)],
        })
        mock_read_sql.return_value = df
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_decision_tree
        result, metrics = train_decision_tree()

        assert result is not None
        assert metrics['accuracy'] > 0

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_logistic_regression_all_churned(self, mock_read_sql, mock_engine, mock_engine_connect):
        """If all customers have low spending_score, all are churned."""
        df = pd.DataFrame({
            'CustomerID': range(1, 51),
            'Gender': ['Male', 'Female'] * 25,
            'Age': [25 + i % 30 for i in range(50)],
            'income': [20 + i * 1.0 for i in range(50)],
            'spending_score': [5 + i * 0.4 for i in range(50)],  # All below 30
        })
        mock_read_sql.return_value = df
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression
        result, metrics = train_logistic_regression()

        assert result is not None
        # Churn rate should be 1.0 since all spending_score < 30
        assert metrics['churn_rate'] == 1.0

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_logistic_regression_no_churn(self, mock_read_sql, mock_engine, mock_engine_connect):
        """If all customers have high spending_score, none are churned."""
        df = pd.DataFrame({
            'CustomerID': range(1, 51),
            'Gender': ['Male', 'Female'] * 25,
            'Age': [25 + i % 30 for i in range(50)],
            'income': [20 + i * 1.0 for i in range(50)],
            'spending_score': [50 + i * 0.5 for i in range(50)],  # All above 30
        })
        mock_read_sql.return_value = df
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_logistic_regression
        result, metrics = train_logistic_regression()

        assert result is not None
        assert metrics['churn_rate'] == 0.0

    @patch('ai_engine.ml_models.engine')
    @patch('ai_engine.ml_models.pd.read_sql')
    def test_segments_with_partial_nan_features(self, mock_read_sql, mock_engine, mock_engine_connect):
        """Some rows have NaN in feature columns; those rows should be dropped."""
        df = pd.DataFrame({
            'CustomerID': range(1, 51),
            'Gender': ['Male', 'Female'] * 25,
            'Age': [30] * 50,
            'income': [15 + i * 1.5 if i % 5 != 0 else np.nan for i in range(50)],
            'spending_score': [10 + i * 1.8 for i in range(50)],
        })
        mock_read_sql.return_value = df
        mock_engine.connect.return_value = mock_engine_connect

        from ai_engine.ml_models import train_customer_segments
        result, metrics = train_customer_segments()

        assert result is not None
        # Should have fewer rows than original due to NaN drops
        assert len(result) < 50
        assert metrics['n_clusters'] == 4


# ---------------------------------------------------------------------------
# Tests: save_model_metrics
# ---------------------------------------------------------------------------


class TestSaveModelMetrics:
    """Tests for saving metrics to the database."""

    @patch('ai_engine.ml_models.engine')
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

        # Should execute CREATE TABLE and INSERT
        assert mock_engine_connect.execute.call_count == 2
        mock_engine_connect.commit.assert_called_once()
