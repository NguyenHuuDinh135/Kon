import json

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
import pandas as pd
import numpy as np

from db_core import get_db, engine
from db_core.models import User
from auth import get_current_user, require_admin

router = APIRouter()


def get_safe_params(data):
    """Helper to handle JSON parameters that might be already parsed by SQLAlchemy/Postgres."""
    if isinstance(data, dict):
        return data
    if isinstance(data, str):
        try:
            return json.loads(data)
        except:
            return {}
    return {}


@router.get("/predictions/decision-tree")
def get_decision_tree_predictions(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Decision Tree predictions from customer_churn table (DT columns added by ML agent)."""
    query = """
    SELECT "CustomerID", "Gender", "Tenure", "CityTier",
           "PreferedOrderCat", "SatisfactionScore",
           "OrderCount", "CashbackAmount", "Churn",
           "DT_Label", "DT_Confidence"
    FROM customer_churn
    WHERE "DT_Label" IS NOT NULL
    ORDER BY "DT_Confidence" DESC
    """
    try:
        df = pd.read_sql(query, engine)
    except Exception:
        # DT columns may not exist yet (ML agent hasn't run)
        return {"predictions": [], "summary": {}, "message": "DT model not yet trained"}

    if df.empty:
        return {"predictions": [], "summary": {}}

    summary = df["DT_Label"].value_counts().to_dict()
    df = df.replace({np.nan: None, np.inf: None, -np.inf: None})
    return {"predictions": df.to_dict(orient="records"), "summary": summary, "total": len(df)}


@router.get("/predictions/clustering")
def get_clustering_predictions(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """K-Means clustering results from customer_segments table (RFM-based)."""
    query = """
    SELECT "CustomerID", cluster, cluster_label, recency, frequency, monetary
    FROM customer_segments
    ORDER BY cluster
    """
    try:
        df = pd.read_sql(query, engine)
    except Exception:
        return {"predictions": [], "clusters": [], "message": "Clustering model not yet trained"}

    if df.empty:
        return {"predictions": [], "clusters": []}

    clusters_summary = []
    for cluster_id in sorted(df["cluster"].unique()):
        group = df[df["cluster"] == cluster_id]
        clusters_summary.append(
            {
                "cluster_id": int(cluster_id),
                "label": group["cluster_label"].iloc[0],
                "count": len(group),
                "avg_recency": round(float(group["recency"].mean()), 1),
                "avg_frequency": round(float(group["frequency"].mean()), 1),
                "avg_monetary": round(float(group["monetary"].mean()), 2),
            }
        )

    df = df.replace({np.nan: None, np.inf: None, -np.inf: None})
    return {"predictions": df.to_dict(orient="records"), "clusters": clusters_summary, "total": len(df)}


@router.get("/predictions/logistic-regression")
def get_logistic_regression_predictions(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Logistic Regression churn predictions from customer_churn table."""
    query = """
    SELECT "CustomerID", "Gender", "Tenure", "CityTier",
           "PreferedOrderCat", "SatisfactionScore",
           "OrderCount", "CashbackAmount", "Churn",
           "Churn_Prediction", "Churn_Probability"
    FROM customer_churn
    WHERE "Churn_Probability" IS NOT NULL
    ORDER BY "Churn_Probability" DESC
    """
    try:
        df = pd.read_sql(query, engine)
    except Exception:
        return {"predictions": [], "summary": {}, "message": "LR model not yet trained"}

    if df.empty:
        return {"predictions": [], "summary": {}}

    total = len(df)
    churned = int(df["Churn_Prediction"].sum()) if "Churn_Prediction" in df.columns else 0
    summary = {
        "total_customers": total,
        "predicted_churn": churned,
        "churn_rate": round(churned / max(total, 1), 4),
        "avg_probability": round(float(df["Churn_Probability"].mean()), 4),
        "high_risk_count": int((df["Churn_Probability"] > 0.7).sum()),
        "medium_risk_count": int(
            ((df["Churn_Probability"] > 0.3) & (df["Churn_Probability"] <= 0.7)).sum()
        ),
        "low_risk_count": int((df["Churn_Probability"] <= 0.3).sum()),
    }

    df = df.replace({np.nan: None, np.inf: None, -np.inf: None})
    return {"predictions": df.to_dict(orient="records"), "summary": summary, "total": total}


@router.get("/predictions/compare")
def get_model_comparison(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Compare all model predictions side by side from customer_churn."""
    query = """
    SELECT "CustomerID", "Gender", "Tenure", "CityTier",
           "PreferedOrderCat", "SatisfactionScore",
           "OrderCount", "CashbackAmount", "Churn",
           "Cluster", "DT_Label", "DT_Confidence",
           "Churn_Prediction", "Churn_Probability"
    FROM customer_churn
    ORDER BY "CustomerID"
    """
    try:
        df = pd.read_sql(query, engine)
    except Exception:
        return {"customers": [], "models": []}

    if df.empty:
        return {"customers": [], "models": []}

    cluster_names = {0: "High Value", 1: "At Risk", 2: "Loyal", 3: "New/Casual"}
    if "Cluster" in df.columns:
        df["cluster_label"] = df["Cluster"].map(cluster_names)

    df = df.replace({np.nan: None, np.inf: None, -np.inf: None})
    return {"customers": df.to_dict(orient="records"), "total": len(df)}


@router.get("/models/metrics")
def get_model_metrics(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get performance metrics for all trained models."""
    query = """
    SELECT DISTINCT ON (model_name)
        model_name, accuracy, precision_score, recall, f1_score, parameters, trained_at
    FROM ml_model_metrics
    ORDER BY model_name, trained_at DESC
    """
    try:
        df = pd.read_sql(query, engine)
        # Handle NaN values for JSON compatibility
        df = df.replace({np.nan: None})
        return df.to_dict(orient="records")
    except Exception:
        return []


@router.post("/models/retrain")
def retrain_models(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin),
):
    """Manually trigger model retraining (admin only)."""
    from ai_engine.ml_models import run_all_ml_tasks

    background_tasks.add_task(run_all_ml_tasks)
    return {"message": "Model retraining started in background", "status": "accepted"}


@router.get("/models/evaluation-report")
def get_evaluation_report(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Detailed model evaluation with confusion matrices and CV scores."""
    query = """
    SELECT model_name, parameters FROM ml_model_metrics
    WHERE model_name IN ('Decision Tree', 'Logistic Regression', 'KMeans Clustering')
    ORDER BY trained_at DESC
    LIMIT 3
    """
    df = pd.read_sql(query, engine)
    reports = []
    for _, row in df.iterrows():
        params = get_safe_params(row["parameters"])
        reports.append(
            {
                "model_name": row["model_name"],
                "confusion_matrix": params.get("confusion_matrix"),
                "classification_report": params.get("classification_report"),
                "cv_scores_mean": params.get("cv_scores_mean"),
                "cv_scores_std": params.get("cv_scores_std"),
                "best_params": params.get("best_params"),
                "feature_importance": params.get("feature_importance"),
                "silhouette_scores": params.get("silhouette_scores"),
            }
        )
    return reports


@router.get("/models/shap-values")
def get_shap_values(
    model_name: str = Query(default="Decision Tree"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get SHAP feature importance for a trained model."""
    query = text("""
        SELECT parameters FROM ml_model_metrics
        WHERE model_name = :name
        ORDER BY trained_at DESC LIMIT 1
    """)
    df = pd.read_sql(query, engine, params={"name": model_name})
    if df.empty:
        return {"model_name": model_name, "shap_importance": {}, "feature_importance": {}}
    params = get_safe_params(df.iloc[0]["parameters"])
    return {
        "model_name": model_name,
        "shap_importance": params.get("shap_importance", {}),
        "feature_importance": params.get("feature_importance", {}),
    }


@router.get("/models/roc-curve")
def get_roc_curve(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get ROC curve data for Logistic Regression."""
    query = text("""
        SELECT parameters FROM ml_model_metrics
        WHERE model_name = 'Logistic Regression'
        ORDER BY trained_at DESC LIMIT 1
    """)
    df = pd.read_sql(query, engine)
    if df.empty:
        return {"roc_curve": None}
    params = get_safe_params(df.iloc[0]["parameters"])
    return params.get("roc_curve", {"fpr": [], "tpr": [], "auc": 0})


@router.get("/models/history")
def get_model_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get training history for all models (versioning)."""
    query = text("""
        SELECT model_name, accuracy, f1_score,
               trained_at, parameters->>'version' as version
        FROM ml_model_metrics
        ORDER BY trained_at DESC
        LIMIT 50
    """)
    df = pd.read_sql(query, engine)
    # Handle NaN values
    df = df.replace({np.nan: None})
    return df.to_dict(orient="records")


@router.get("/models/learning-curves")
def get_learning_curves(
    model_name: str = Query(default="Decision Tree"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get learning curve data for a trained model."""
    query = text("""
        SELECT parameters FROM ml_model_metrics
        WHERE model_name = :name
        ORDER BY trained_at DESC LIMIT 1
    """)
    df = pd.read_sql(query, engine, params={"name": model_name})
    if df.empty:
        return {"model_name": model_name, "learning_curve": None}
    params = get_safe_params(df.iloc[0]["parameters"])
    return {
        "model_name": model_name,
        "learning_curve": params.get("learning_curve"),
    }
