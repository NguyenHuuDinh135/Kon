import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import (
    train_test_split,
    cross_val_score,
    StratifiedKFold,
    GridSearchCV,
    learning_curve,
)
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    silhouette_score,
    confusion_matrix,
    classification_report,
    roc_auc_score,
    roc_curve,
)
from sqlalchemy import text
from db_core.database import SessionLocal, engine
from db_core.models import MLRecommendation, SystemAlert
from datetime import datetime
import json

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False


def get_rfm_data():
    """Compute RFM from online_retail transactions (4,300+ unique customers)."""
    query = """
    SELECT "CustomerID",
           MAX("InvoiceDate") as last_purchase,
           COUNT(DISTINCT "InvoiceNo") as frequency,
           SUM("TotalAmount") as monetary
    FROM online_retail
    WHERE "CustomerID" IS NOT NULL
    GROUP BY "CustomerID"
    """
    df = pd.read_sql(query, engine)
    if df.empty:
        return df
    df['last_purchase'] = pd.to_datetime(df['last_purchase'])
    max_date = df['last_purchase'].max()
    df['recency'] = (max_date - df['last_purchase']).dt.days
    return df


def train_customer_segments():
    """K-Means clustering on RFM features from 4,300+ online retail customers."""
    df = get_rfm_data()
    if df.empty:
        return None, {}

    features = ['recency', 'frequency', 'monetary']
    X = df[features].dropna()
    if X.empty:
        return None, {}

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Elbow Method + Silhouette analysis (k=2 to 8)
    silhouette_scores = {}
    for k in range(2, 9):
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        k_labels = km.fit_predict(X_scaled)
        silhouette_scores[k] = round(float(silhouette_score(X_scaled, k_labels)), 4)

    best_k = max(silhouette_scores, key=silhouette_scores.get)
    # Use k=5 for business interpretability
    chosen_k = 5

    kmeans = KMeans(n_clusters=chosen_k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)

    df_valid = df.loc[X.index].copy()
    df_valid['cluster'] = labels

    cluster_names = {0: "VIP", 1: "Loyal", 2: "At Risk", 3: "Casual", 4: "New"}
    df_valid['cluster_label'] = df_valid['cluster'].map(cluster_names)

    sil_score = silhouette_score(X_scaled, labels)

    metrics = {
        "model_name": "KMeans Clustering",
        "silhouette_score": round(float(sil_score), 4),
        "inertia": round(float(kmeans.inertia_), 2),
        "n_clusters": chosen_k,
        "best_k_by_silhouette": best_k,
        "silhouette_scores": silhouette_scores,
        "cluster_centers": kmeans.cluster_centers_.tolist(),
        "cluster_sizes": {
            str(k): int(v)
            for k, v in df_valid['cluster'].value_counts().items()
        },
        "features": features,
        "n_customers": len(df_valid),
        "trained_at": datetime.now().isoformat(),
    }

    # Save cluster assignments back to database
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS customer_segments (
                "CustomerID" INTEGER PRIMARY KEY,
                cluster INTEGER,
                cluster_label VARCHAR(20),
                recency INTEGER,
                frequency INTEGER,
                monetary FLOAT
            )
        """))
        conn.execute(text("TRUNCATE TABLE customer_segments"))
        for _, row in df_valid.iterrows():
            conn.execute(text("""
                INSERT INTO customer_segments
                    ("CustomerID", cluster, cluster_label, recency, frequency, monetary)
                VALUES (:cid, :cluster, :label, :recency, :freq, :monetary)
            """), {
                "cid": int(row['CustomerID']),
                "cluster": int(row['cluster']),
                "label": cluster_names.get(int(row['cluster']), "Unknown"),
                "recency": int(row['recency']),
                "freq": int(row['frequency']),
                "monetary": float(row['monetary']),
            })
        conn.commit()

    return df_valid, metrics


def train_decision_tree():
    """Decision Tree on E-Commerce Churn features (5,630 rows).

    Target: engagement_level derived from OrderCount + CouponUsed + HourSpendOnApp.
    """
    query = 'SELECT * FROM customer_churn'
    df = pd.read_sql(query, engine)
    if df.empty or len(df) < 10:
        return None, {}

    # Create composite engagement score from behavioral features
    score_cols = ['OrderCount', 'CouponUsed', 'HourSpendOnApp']
    for col in score_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    df = df.dropna(subset=score_cols)

    # Normalize each component to 0-1 range then sum
    for col in score_cols:
        col_min = df[col].min()
        col_max = df[col].max()
        if col_max > col_min:
            df[f'{col}_norm'] = (df[col] - col_min) / (col_max - col_min)
        else:
            df[f'{col}_norm'] = 0.0

    df['engagement_score'] = (
        df['OrderCount_norm']
        + df['CouponUsed_norm']
        + df['HourSpendOnApp_norm']
    )

    # Bin into quartile-based categories
    labels_cat = ['Low', 'Medium', 'High', 'VIP']
    df['engagement_level'] = pd.qcut(
        df['engagement_score'],
        q=4,
        labels=labels_cat,
        duplicates='drop',
    )

    # Features (exclude churn-related to avoid leakage)
    feature_cols = [
        'Tenure', 'SatisfactionScore', 'NumberOfDeviceRegistered',
        'WarehouseToHome', 'NumberOfAddress', 'CashbackAmount',
    ]
    df_clean = df.dropna(subset=feature_cols + ['engagement_level'])
    if len(df_clean) < 10:
        return None, {}

    X = df_clean[feature_cols].astype(float)
    y = df_clean['engagement_level'].cat.codes.values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # GridSearchCV for hyperparameter tuning
    param_grid = {
        'max_depth': [3, 4, 5, 6, 7, 8],
        'min_samples_leaf': [3, 5, 7, 10, 15],
        'min_samples_split': [2, 5, 10],
    }
    grid = GridSearchCV(
        DecisionTreeClassifier(random_state=42),
        param_grid,
        cv=5,
        scoring='f1_weighted',
        n_jobs=-1,
    )
    grid.fit(X_train, y_train)
    clf = grid.best_estimator_

    y_pred_test = clf.predict(X_test)

    # Predictions for all data
    df_clean = df_clean.copy()
    df_clean['dt_label'] = clf.predict(X)
    # Convert numeric prediction back to label name
    df_clean['dt_label_name'] = df_clean['dt_label'].map(lambda x: labels_cat[x])
    df_clean['dt_confidence'] = clf.predict_proba(X).max(axis=1)

    # Cross-validation for robust performance estimate
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(clf, X, y, cv=skf, scoring='f1_weighted')

    accuracy = accuracy_score(y_test, y_pred_test)
    precision = precision_score(y_test, y_pred_test, average='weighted', zero_division=0)
    recall_val = recall_score(y_test, y_pred_test, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred_test, average='weighted', zero_division=0)

    cm = confusion_matrix(y_test, y_pred_test)
    cls_report = classification_report(y_test, y_pred_test, output_dict=True)

    feature_importance = dict(zip(feature_cols, clf.feature_importances_.tolist()))

    metrics = {
        "model_name": "Decision Tree",
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall_val), 4),
        "f1_score": round(float(f1), 4),
        "cv_scores_mean": round(float(cv_scores.mean()), 4),
        "cv_scores_std": round(float(cv_scores.std()), 4),
        "best_params": grid.best_params_,
        "confusion_matrix": cm.tolist(),
        "classification_report": cls_report,
        "max_depth": clf.get_depth(),
        "feature_importance": feature_importance,
        "classes": labels_cat,
        "train_size": len(X_train),
        "test_size": len(X_test),
        "trained_at": datetime.now().isoformat(),
    }

    # SHAP explainability
    if SHAP_AVAILABLE:
        try:
            explainer = shap.TreeExplainer(clf)
            shap_values = explainer.shap_values(X_test)
            # shap_values may be a list (one array per class) or 2D array
            if isinstance(shap_values, list):
                # Use class 1 (or average across classes)
                shap_abs = np.abs(np.array(shap_values)).mean(axis=0).mean(axis=0)
            elif shap_values.ndim == 3:
                shap_abs = np.abs(shap_values).mean(axis=0).mean(axis=0)
            else:
                shap_abs = np.abs(shap_values).mean(axis=0)
            shap_importance = dict(zip(feature_cols, shap_abs.tolist()))
            metrics["shap_importance"] = shap_importance
        except Exception as e:
            metrics["shap_importance"] = {"error": str(e)}

    # Learning curve
    try:
        train_sizes_lc, train_scores_lc, val_scores_lc = learning_curve(
            clf, X, y, cv=5, train_sizes=np.linspace(0.1, 1.0, 10),
            scoring='f1_weighted', n_jobs=-1,
        )
        metrics["learning_curve"] = {
            "train_sizes": train_sizes_lc.tolist(),
            "train_scores_mean": train_scores_lc.mean(axis=1).tolist(),
            "val_scores_mean": val_scores_lc.mean(axis=1).tolist(),
        }
    except Exception as e:
        metrics["learning_curve"] = {"error": str(e)}

    return df_clean, metrics


def train_logistic_regression():
    """Logistic Regression with REAL churn labels (5,630 rows).

    Uses the 'Churn' column (0/1) from customer_churn table.
    """
    query = 'SELECT * FROM customer_churn'
    df = pd.read_sql(query, engine)
    if df.empty or len(df) < 10:
        return None, {}

    # Target: real churn labels
    df['Churn'] = pd.to_numeric(df['Churn'], errors='coerce')
    df = df.dropna(subset=['Churn'])

    # Numeric features
    numeric_features = [
        'Tenure', 'CityTier', 'WarehouseToHome', 'HourSpendOnApp',
        'NumberOfDeviceRegistered', 'SatisfactionScore', 'NumberOfAddress',
        'Complain', 'OrderAmountHikeFromlastYear', 'CouponUsed',
        'OrderCount', 'DaySinceLastOrder', 'CashbackAmount',
    ]

    # Categorical features to one-hot encode
    categorical_features = [
        'PreferredLoginDevice', 'PreferredPaymentMode',
        'Gender', 'MaritalStatus', 'PreferedOrderCat',
    ]

    # Convert numeric columns
    for col in numeric_features:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # One-hot encode categoricals
    df_encoded = pd.get_dummies(df, columns=categorical_features, drop_first=True)

    # Get all feature columns (numeric + one-hot encoded)
    one_hot_cols = [
        c for c in df_encoded.columns
        if any(c.startswith(f'{cat}_') for cat in categorical_features)
    ]
    all_features = numeric_features + one_hot_cols

    # Drop rows with missing values in features or target
    df_clean = df_encoded.dropna(subset=all_features + ['Churn'])
    if len(df_clean) < 10:
        return None, {}

    X = df_clean[all_features].astype(float)
    y = df_clean['Churn'].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    X_all_scaled = scaler.transform(X)

    lr = LogisticRegression(random_state=42, max_iter=1000)
    lr.fit(X_train_scaled, y_train)

    y_pred_test = lr.predict(X_test_scaled)
    y_proba_test = lr.predict_proba(X_test_scaled)
    y_proba_all = lr.predict_proba(X_all_scaled)

    # Cross-validation
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(lr, X_all_scaled, y, cv=skf, scoring='f1')

    # Predictions on all data
    df_clean = df_clean.copy()
    df_clean['churn_prediction'] = lr.predict(X_all_scaled)
    df_clean['churn_probability'] = y_proba_all[:, 1]

    accuracy = accuracy_score(y_test, y_pred_test)
    precision = precision_score(y_test, y_pred_test, zero_division=0)
    recall_val = recall_score(y_test, y_pred_test, zero_division=0)
    f1 = f1_score(y_test, y_pred_test, zero_division=0)

    # ROC-AUC
    roc_auc = roc_auc_score(y_test, y_proba_test[:, 1])

    # ROC Curve data points (sampled to 20 for API response)
    fpr, tpr, _thresholds = roc_curve(y_test, y_proba_test[:, 1])
    indices = np.linspace(0, len(fpr) - 1, 20, dtype=int)
    roc_data = {
        "fpr": fpr[indices].tolist(),
        "tpr": tpr[indices].tolist(),
        "auc": round(float(roc_auc), 4),
    }

    cm = confusion_matrix(y_test, y_pred_test)
    cls_report = classification_report(y_test, y_pred_test, output_dict=True)

    # Top coefficients (by absolute value)
    coef_dict = dict(zip(all_features, lr.coef_[0].tolist()))
    top_features = dict(
        sorted(coef_dict.items(), key=lambda x: abs(x[1]), reverse=True)[:10]
    )

    metrics = {
        "model_name": "Logistic Regression",
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall_val), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(roc_auc), 4),
        "roc_curve": roc_data,
        "cv_scores_mean": round(float(cv_scores.mean()), 4),
        "cv_scores_std": round(float(cv_scores.std()), 4),
        "confusion_matrix": cm.tolist(),
        "classification_report": cls_report,
        "top_coefficients": top_features,
        "intercept": round(float(lr.intercept_[0]), 4),
        "churn_rate": round(float(y.mean()), 4),
        "n_features": len(all_features),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "trained_at": datetime.now().isoformat(),
    }

    # SHAP explainability
    if SHAP_AVAILABLE:
        try:
            explainer = shap.LinearExplainer(lr, X_train_scaled)
            shap_values = explainer.shap_values(X_test_scaled)
            shap_importance = dict(
                zip(all_features, np.abs(shap_values).mean(axis=0).tolist())
            )
            metrics["shap_importance"] = shap_importance
        except Exception as e:
            metrics["shap_importance"] = {"error": str(e)}

    # Learning curve
    try:
        train_sizes_lc, train_scores_lc, val_scores_lc = learning_curve(
            lr, X_all_scaled, y, cv=5, train_sizes=np.linspace(0.1, 1.0, 10),
            scoring='f1', n_jobs=-1,
        )
        metrics["learning_curve"] = {
            "train_sizes": train_sizes_lc.tolist(),
            "train_scores_mean": train_scores_lc.mean(axis=1).tolist(),
            "val_scores_mean": val_scores_lc.mean(axis=1).tolist(),
        }
    except Exception as e:
        metrics["learning_curve"] = {"error": str(e)}

    return df_clean, metrics


def train_revenue_forecast():
    """Simple linear regression forecast using Olist monthly revenue."""
    query = """
    SELECT DATE_TRUNC('month', order_purchase_timestamp::timestamp) as month,
           SUM(oi.price + oi.freight_value) as revenue
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY month
    ORDER BY month
    """
    df = pd.read_sql(query, engine)
    if df.empty or len(df) < 4:
        return None, {}

    df['month'] = pd.to_datetime(df['month'])
    df['month_num'] = np.arange(len(df))

    X = df[['month_num']].values
    y = df['revenue'].values

    model = LinearRegression()
    model.fit(X, y)

    y_pred = model.predict(X)
    residuals = y - y_pred
    ss_res = np.sum(residuals ** 2)
    ss_tot = np.sum((y - y.mean()) ** 2)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0.0

    # Forecast next 3 months
    last_month_num = int(df['month_num'].max())
    future_X = np.array([[last_month_num + i] for i in range(1, 4)])
    future_revenue = model.predict(future_X)

    last_month = df['month'].max()
    forecast = []
    for i, rev in enumerate(future_revenue, start=1):
        forecast_month = last_month + pd.DateOffset(months=i)
        forecast.append({
            "month": forecast_month.strftime('%Y-%m'),
            "predicted_revenue": round(float(rev), 2),
        })

    metrics = {
        "model_name": "Revenue Forecast",
        "r_squared": round(float(r_squared), 4),
        "slope": round(float(model.coef_[0]), 2),
        "intercept": round(float(model.intercept_), 2),
        "n_months": len(df),
        "avg_monthly_revenue": round(float(y.mean()), 2),
        "forecast_next_3_months": forecast,
        "trained_at": datetime.now().isoformat(),
    }

    return df, metrics


def generate_recommendations():
    """Product recommendations using Frequently Bought Together logic on Olist data."""
    query = """
    SELECT oi.order_id, oi.product_id, oi.price
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.order_status = 'delivered'
    """
    df = pd.read_sql(query, engine)
    if df.empty:
        return []

    # Top 20 most purchased products
    top_products = df['product_id'].value_counts().head(20).index.tolist()

    # Get customer-product mapping via orders
    cust_query = """
    SELECT o.customer_id, oi.product_id
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'delivered'
    """
    cust_df = pd.read_sql(cust_query, engine)
    if cust_df.empty:
        return []

    recommendations = []
    for customer_id in cust_df['customer_id'].unique()[:500]:
        bought = cust_df[cust_df['customer_id'] == customer_id]['product_id'].tolist()
        suggested_ids = [p for p in top_products if p not in bought][:3]

        if suggested_ids:
            recommendations.append({
                "CustomerID": customer_id,
                "RecommendedProducts": suggested_ids,
                "Score": 0.85,
            })

    return recommendations


def run_all_ml_tasks():
    """Execute all ML training pipelines and save results."""
    print("=" * 60)
    print("Running ML Pipeline...")
    print("=" * 60)

    # Ensure columns exist in customer_churn
    ensure_prediction_columns()

    print("\n[1/5] Training K-Means Clustering (Online Retail RFM)...")
    seg_result, seg_metrics = train_customer_segments()
    if seg_metrics:
        print(f"  Silhouette Score: {seg_metrics.get('silhouette_score')}")
        print(f"  Customers clustered: {seg_metrics.get('n_customers')}")
        save_model_metrics(seg_metrics)

    print("\n[2/5] Training Decision Tree (Engagement Classification)...")
    dt_result, dt_metrics = train_decision_tree()
    if dt_metrics:
        print(f"  Accuracy: {dt_metrics.get('accuracy')}")
        print(f"  F1 Score: {dt_metrics.get('f1_score')}")
        print(f"  Best Params: {dt_metrics.get('best_params')}")
        save_model_metrics(dt_metrics)
        
        # Save DT predictions to customer_churn (batch update)
        if isinstance(dt_result, pd.DataFrame):
            print(f"  Saving Decision Tree predictions for {len(dt_result)} customers...")
            updates = [
                {"cid": int(row["CustomerID"]), "label": row["dt_label_name"], "conf": float(row["dt_confidence"])}
                for _, row in dt_result.iterrows()
            ]
            with engine.connect() as conn:
                conn.execute(
                    text('UPDATE customer_churn SET "DT_Label" = :label, "DT_Confidence" = :conf WHERE "CustomerID" = :cid'),
                    updates,
                )
                conn.commit()

    print("\n[3/5] Training Logistic Regression (Real Churn Labels)...")
    lr_result, lr_metrics = train_logistic_regression()
    if lr_metrics:
        print(f"  Accuracy: {lr_metrics.get('accuracy')}")
        print(f"  ROC-AUC: {lr_metrics.get('roc_auc')}")
        print(f"  Churn Rate: {lr_metrics.get('churn_rate')}")
        save_model_metrics(lr_metrics)

        # Save LR predictions to customer_churn (batch update)
        if isinstance(lr_result, pd.DataFrame):
            print(f"  Saving Logistic Regression predictions for {len(lr_result)} customers...")
            updates = [
                {"cid": int(row["CustomerID"]), "pred": int(row["churn_prediction"]), "prob": float(row["churn_probability"])}
                for _, row in lr_result.iterrows()
            ]
            with engine.connect() as conn:
                conn.execute(
                    text('UPDATE customer_churn SET "Churn_Prediction" = :pred, "Churn_Probability" = :prob WHERE "CustomerID" = :cid'),
                    updates,
                )
                conn.commit()

    print("\n[4/5] Training Revenue Forecast (Olist Monthly)...")
    rev_result, rev_metrics = train_revenue_forecast()
    if rev_metrics:
        print(f"  R-squared: {rev_metrics.get('r_squared')}")
        print(f"  Avg Monthly Revenue: {rev_metrics.get('avg_monthly_revenue')}")
        for fc in rev_metrics.get('forecast_next_3_months', []):
            print(f"    {fc['month']}: ${fc['predicted_revenue']:,.2f}")
        save_model_metrics(rev_metrics)

    print("\n[5/5] Generating Product Recommendations (Olist)...")
    recommendations = generate_recommendations()

    session = SessionLocal()
    try:
        # Generate churn alerts for high-risk customers
        if isinstance(lr_result, pd.DataFrame) and not lr_result.empty:
            high_risk = lr_result[lr_result['churn_probability'] > 0.7]
            for _, row in high_risk.iterrows():
                alert = SystemAlert(
                    Type="Churn",
                    Message=(
                        f"Customer {row['CustomerID']} has high churn probability "
                        f"({row['churn_probability']:.0%})"
                    ),
                    Severity="High",
                    RelatedID=str(row['CustomerID']),
                )
                session.add(alert)

        # Save recommendations
        session.query(MLRecommendation).delete()
        for rec in recommendations:
            obj = MLRecommendation(
                CustomerID=rec['CustomerID'],
                RecommendedProducts=rec['RecommendedProducts'],
                Score=rec['Score'],
            )
            session.add(obj)

        session.commit()
        print(f"\n{'=' * 60}")
        print(f"ML Pipeline Complete. {len(recommendations)} recommendations generated.")
        print(f"{'=' * 60}")
    except Exception as e:
        print(f"Error saving ML results: {e}")
        session.rollback()
    finally:
        session.close()


def ensure_prediction_columns():
    """Ensure customer_churn table has all necessary columns for ML predictions."""
    cols = [
        ("Cluster", "INTEGER"),
        ("DT_Label", "VARCHAR(50)"),
        ("DT_Confidence", "FLOAT"),
        ("Churn_Prediction", "INTEGER"),
        ("Churn_Probability", "FLOAT")
    ]
    with engine.connect() as conn:
        for col_name, col_type in cols:
            conn.execute(text(f"ALTER TABLE customer_churn ADD COLUMN IF NOT EXISTS \"{col_name}\" {col_type}"))
        conn.commit()


def save_model_metrics(metrics: dict):
    """Save model training metrics to the database with version tracking."""
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS ml_model_metrics (
                id SERIAL PRIMARY KEY,
                model_name VARCHAR(100),
                accuracy FLOAT,
                precision_score FLOAT,
                recall FLOAT,
                f1_score FLOAT,
                parameters JSONB,
                trained_at TIMESTAMP DEFAULT NOW()
            )
        """))

        # Model versioning: count existing entries to determine version
        result = conn.execute(text(
            "SELECT COUNT(*) FROM ml_model_metrics WHERE model_name = :name"
        ), {"name": metrics.get("model_name")})
        version = result.scalar() + 1
        metrics["version"] = version

        conn.execute(text("""
            INSERT INTO ml_model_metrics
                (model_name, accuracy, precision_score, recall, f1_score, parameters, trained_at)
            VALUES (:name, :acc, :prec, :rec, :f1, :params, NOW())
        """), {
            "name": metrics.get("model_name"),
            "acc": metrics.get("accuracy"),
            "prec": metrics.get("precision"),
            "rec": metrics.get("recall"),
            "f1": metrics.get("f1_score"),
            "params": json.dumps(metrics, default=str),
        })
        conn.commit()
