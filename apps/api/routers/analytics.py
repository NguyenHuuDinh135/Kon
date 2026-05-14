from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import json
import pandas as pd
import numpy as np

from db_core import get_db, engine
from db_core.models import (
    Customer,
    Order,
    OrderItem,
    Product,
    Notification,
    CustomerChurn,
    OnlineRetailTransaction,
    MLRecommendation,
    SystemAlert,
    User,
)
from auth import get_current_user
from shared import (
    DashboardKPIs,
    SystemAlert as SharedAlert,
    Recommendation as SharedRecommendation,
)

router = APIRouter()


@router.get("/dashboard/kpis", response_model=DashboardKPIs)
def get_dashboard_kpis(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    total_revenue = (
        db.query(func.sum(OrderItem.price)).scalar() or 0.0
    )

    # Churn rate from customer_churn table
    total_churn_customers = db.query(CustomerChurn).count()
    churned_count = (
        db.query(CustomerChurn).filter(CustomerChurn.Churn == 1).count()
    )
    churn_rate = round(churned_count / max(total_churn_customers, 1), 4)

    # Average satisfaction from customer_churn
    avg_satisfaction = (
        db.query(func.avg(CustomerChurn.SatisfactionScore)).scalar() or 0.0
    )

    # Average churn probability from ML predictions
    avg_churn_prob_result = pd.read_sql(
        'SELECT AVG("Churn_Probability") as avg_prob FROM customer_churn WHERE "Churn_Probability" IS NOT NULL',
        engine,
    )
    avg_churn_prob = float(avg_churn_prob_result.iloc[0]["avg_prob"]) if not avg_churn_prob_result.empty and avg_churn_prob_result.iloc[0]["avg_prob"] is not None else 0.0

    # Period-over-period trend using the latest month in the dataset (not CURRENT_TIMESTAMP)
    trend_query = """
    WITH max_date AS (
        SELECT DATE_TRUNC('month', MAX(TO_TIMESTAMP(order_purchase_timestamp, 'YYYY-MM-DD HH24:MI:SS'))) as latest_month
        FROM orders
    )
    SELECT
        COALESCE(SUM(CASE
            WHEN DATE_TRUNC('month', TO_TIMESTAMP(o.order_purchase_timestamp, 'YYYY-MM-DD HH24:MI:SS'))
                 = md.latest_month
            THEN oi.price ELSE 0 END), 0) as current_month_revenue,
        COALESCE(SUM(CASE
            WHEN DATE_TRUNC('month', TO_TIMESTAMP(o.order_purchase_timestamp, 'YYYY-MM-DD HH24:MI:SS'))
                 = md.latest_month - INTERVAL '1 month'
            THEN oi.price ELSE 0 END), 0) as last_month_revenue,
        COUNT(DISTINCT CASE
            WHEN DATE_TRUNC('month', TO_TIMESTAMP(o.order_purchase_timestamp, 'YYYY-MM-DD HH24:MI:SS'))
                 = md.latest_month
            THEN o.order_id END) as current_month_orders,
        COUNT(DISTINCT CASE
            WHEN DATE_TRUNC('month', TO_TIMESTAMP(o.order_purchase_timestamp, 'YYYY-MM-DD HH24:MI:SS'))
                 = md.latest_month - INTERVAL '1 month'
            THEN o.order_id END) as last_month_orders,
        COUNT(DISTINCT CASE
            WHEN DATE_TRUNC('month', TO_TIMESTAMP(o.order_purchase_timestamp, 'YYYY-MM-DD HH24:MI:SS'))
                 = md.latest_month
            THEN o.customer_id END) as current_month_customers,
        COUNT(DISTINCT CASE
            WHEN DATE_TRUNC('month', TO_TIMESTAMP(o.order_purchase_timestamp, 'YYYY-MM-DD HH24:MI:SS'))
                 = md.latest_month - INTERVAL '1 month'
            THEN o.customer_id END) as last_month_customers
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    CROSS JOIN max_date md
    """
    try:
        trend_df = pd.read_sql(trend_query, engine)
        row = trend_df.iloc[0]

        current_rev = float(row["current_month_revenue"])
        last_rev = float(row["last_month_revenue"])
        revenue_trend = ((current_rev - last_rev) / max(last_rev, 1)) * 100

        current_orders = int(row["current_month_orders"])
        last_orders = int(row["last_month_orders"])
        orders_trend = ((current_orders - last_orders) / max(last_orders, 1)) * 100

        current_customers = int(row["current_month_customers"])
        last_customers = int(row["last_month_customers"])
        customers_trend = ((current_customers - last_customers) / max(last_customers, 1)) * 100
    except Exception:
        revenue_trend = None
        orders_trend = None
        customers_trend = None

    return {
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "churn_rate": churn_rate,
        "avg_satisfaction": round(float(avg_satisfaction), 2),
        "churn_alerts_count": churned_count,
        "avg_churn_risk": round(float(avg_churn_prob), 4),
        "revenue_trend": round(revenue_trend, 2) if revenue_trend is not None else None,
        "orders_trend": round(orders_trend, 2) if orders_trend is not None else None,
        "customers_trend": round(customers_trend, 2) if customers_trend is not None else None,
    }


@router.get("/dashboard/revenue-over-time")
def get_revenue_over_time(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Monthly revenue for line charts."""
    query = """
    SELECT
        DATE_TRUNC('month', TO_TIMESTAMP(o.order_purchase_timestamp, 'YYYY-MM-DD HH24:MI:SS')) as month,
        SUM(oi.price) as revenue,
        SUM(oi.freight_value) as freight_revenue
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    GROUP BY month
    ORDER BY month ASC
    """
    df = pd.read_sql(query, engine)
    if df.empty:
        return []
    df["month"] = df["month"].dt.strftime("%Y-%m")
    return df.to_dict(orient="records")


@router.get("/dashboard/segmentation-stats")
def get_segmentation_stats(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Customer segmentation from K-Means RFM clustering."""
    query = """
    SELECT cluster_label as segment, COUNT(*) as count
    FROM customer_segments
    GROUP BY cluster_label
    ORDER BY count DESC
    """
    try:
        df = pd.read_sql(query, engine)
        if df.empty:
            raise Exception("No segments")
        return df.to_dict(orient="records")
    except Exception:
        query_fallback = """
        SELECT
            CASE WHEN "Churn" = 1 THEN 'Churned' ELSE 'Active' END as segment,
            COUNT(*) as count
        FROM customer_churn
        GROUP BY segment
        """
        try:
            df = pd.read_sql(query_fallback, engine)
            return df.to_dict(orient="records")
        except Exception:
            return []


@router.get("/dashboard/top-products")
def get_top_products(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Top 10 product categories by revenue."""
    query = """
    SELECT
        COALESCE(p.product_category_name, 'Unknown') as product_category,
        COUNT(*) as total_sold,
        SUM(oi.price) as total_revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    GROUP BY p.product_category_name
    ORDER BY total_revenue DESC
    LIMIT 10
    """
    df = pd.read_sql(query, engine)
    return df.to_dict(orient="records")


@router.get("/alerts", response_model=List[SharedAlert])
def get_alerts(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return db.query(SystemAlert).order_by(SystemAlert.CreatedAt.desc()).limit(50).all()


@router.get("/recommendations/{customer_id}", response_model=List[SharedRecommendation])
def get_recommendations(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(MLRecommendation).filter(MLRecommendation.CustomerID == customer_id).all()


@router.get("/analytics/mdx/revenue-by-segment")
def mdx_revenue_by_segment(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """MDX-style: Revenue sliced by customer state (geographic segment)."""
    query = """
    SELECT
        c.customer_state as segment_id,
        c.customer_state as segment_name,
        COUNT(DISTINCT c.customer_id) as customer_count,
        COUNT(DISTINCT o.order_id) as order_count,
        COALESCE(SUM(oi.price), 0) as total_revenue,
        COALESCE(AVG(oi.price), 0) as avg_order_value
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    GROUP BY c.customer_state
    ORDER BY total_revenue DESC
    LIMIT 20
    """
    df = pd.read_sql(query, engine)
    return df.to_dict(orient="records")


@router.get("/analytics/mdx/churn-by-demographics")
def mdx_churn_by_demographics(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """MDX-style: Churn rate by demographic features from customer_churn table."""
    query = """
    SELECT
        "Gender" as gender,
        "PreferredLoginDevice" as login_device,
        "CityTier" as city_tier,
        COUNT(*) as total,
        SUM(CASE WHEN "Churn" = 1 THEN 1 ELSE 0 END) as churned,
        ROUND(AVG("Churn")::numeric, 4) as churn_rate,
        ROUND(AVG("SatisfactionScore")::numeric, 2) as avg_satisfaction
    FROM customer_churn
    WHERE "Gender" IS NOT NULL
    GROUP BY "Gender", "PreferredLoginDevice", "CityTier"
    ORDER BY churn_rate DESC
    """
    df = pd.read_sql(query, engine)
    return df.to_dict(orient="records")


@router.get("/analytics/mdx/spending-distribution")
def mdx_spending_distribution(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """MDX-style: Spending distribution by preferred order category."""
    query = """
    SELECT
        "PreferedOrderCat" as spending_category,
        COUNT(*) as customer_count,
        ROUND(AVG("Tenure")::numeric, 1) as avg_tenure,
        ROUND(AVG("CashbackAmount")::numeric, 2) as avg_cashback,
        ROUND(AVG("OrderCount")::numeric, 1) as avg_order_count,
        SUM(CASE WHEN "Churn" = 1 THEN 1 ELSE 0 END) as churned_count
    FROM customer_churn
    WHERE "PreferedOrderCat" IS NOT NULL
    GROUP BY "PreferedOrderCat"
    ORDER BY customer_count DESC
    """
    df = pd.read_sql(query, engine)
    return df.to_dict(orient="records")


@router.get("/analytics/clv")
def get_customer_lifetime_value(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Calculate Customer Lifetime Value from online_retail data."""
    query = """
    SELECT
        "CustomerID",
        COUNT(DISTINCT "InvoiceNo") as frequency,
        SUM("TotalAmount") as monetary,
        MIN("InvoiceDate") as first_purchase,
        MAX("InvoiceDate") as last_purchase
    FROM online_retail
    WHERE "CustomerID" IS NOT NULL AND "Quantity" > 0
    GROUP BY "CustomerID"
    ORDER BY monetary DESC
    LIMIT 50
    """
    df = pd.read_sql(query, engine)
    if df.empty:
        return []

    # Simple CLV = avg_order_value * frequency * estimated_lifespan_years
    df["avg_order_value"] = df["monetary"] / df["frequency"].clip(lower=1)
    df["clv"] = df["avg_order_value"] * df["frequency"] * 2  # 2-year estimate
    return df.to_dict(orient="records")


@router.get("/analytics/rfm-scores")
def get_rfm_scores(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """RFM scoring from online_retail table: Recency, Frequency, Monetary per customer."""
    query = """
    SELECT
        "CustomerID",
        CURRENT_DATE - MAX("InvoiceDate")::date as recency_days,
        COUNT(DISTINCT "InvoiceNo") as frequency,
        COALESCE(SUM("TotalAmount"), 0) as monetary
    FROM online_retail
    WHERE "CustomerID" IS NOT NULL AND "Quantity" > 0
    GROUP BY "CustomerID"
    ORDER BY monetary DESC
    LIMIT 100
    """
    df = pd.read_sql(query, engine)
    if df.empty:
        return []

    # Convert timedelta recency_days to integer
    if hasattr(df["recency_days"].iloc[0], "days"):
        df["recency_days"] = df["recency_days"].dt.days

    # Score 1-5 using quintiles
    for col in ["recency_days", "frequency", "monetary"]:
        try:
            if col == "recency_days":
                df[f"{col}_score"] = pd.qcut(
                    df[col], 5, labels=[5, 4, 3, 2, 1], duplicates="drop"
                ).astype(int)
            else:
                df[f"{col}_score"] = pd.qcut(
                    df[col], 5, labels=[1, 2, 3, 4, 5], duplicates="drop"
                ).astype(int)
        except ValueError:
            df[f"{col}_score"] = 3

    df["rfm_score"] = (
        df["recency_days_score"] + df["frequency_score"] + df["monetary_score"]
    )
    return df.to_dict(orient="records")


@router.get("/analytics/forecast")
def get_revenue_forecast(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Simple linear forecast: next 3 months based on historical monthly revenue."""
    query = """
    SELECT DATE_TRUNC('month', TO_TIMESTAMP(o.order_purchase_timestamp, 'YYYY-MM-DD HH24:MI:SS')) as month,
           SUM(oi.price + oi.freight_value) as revenue
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY month
    ORDER BY month
    """
    df = pd.read_sql(query, engine)
    if len(df) < 3:
        return {"historical": [], "forecast": []}

    df["month_num"] = range(len(df))

    # Simple linear regression
    coeffs = np.polyfit(df["month_num"], df["revenue"], deg=1)

    # Predict next 3 months
    last_month_num = df["month_num"].max()
    last_month_date = pd.to_datetime(df["month"].max())
    forecast = []
    for i in range(1, 4):
        pred_revenue = np.polyval(coeffs, last_month_num + i)
        pred_month = last_month_date + pd.DateOffset(months=i)
        forecast.append(
            {
                "month": pred_month.strftime("%Y-%m"),
                "revenue": round(float(max(pred_revenue, 0)), 2),
                "type": "forecast",
            }
        )

    historical = []
    for _, row in df.iterrows():
        historical.append(
            {
                "month": pd.to_datetime(row["month"]).strftime("%Y-%m"),
                "revenue": round(float(row["revenue"]), 2),
                "type": "actual",
            }
        )

    return {"historical": historical, "forecast": forecast}


@router.get("/analytics/ai-insights")
def get_ai_insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get the latest autonomous AI cycle insights."""
    # Get last 5 autonomous cycle logs
    alerts = db.query(SystemAlert).filter(
        SystemAlert.Type == "AutonomousCycle"
    ).order_by(SystemAlert.CreatedAt.desc()).limit(5).all()

    cycles = []
    for alert in alerts:
        try:
            data = json.loads(alert.Message)
            data["created_at"] = alert.CreatedAt.isoformat() if alert.CreatedAt else None
            cycles.append(data)
        except (json.JSONDecodeError, TypeError):
            pass

    return {"cycles": cycles, "total": len(cycles)}
