"""
Kon Autonomous AI Loop
======================
Runs periodically (every 4 hours after ML training).
Implements: Observe -> Analyze -> Plan -> Act cycle.
"""
import json
from datetime import datetime

import pandas as pd
from sqlalchemy import text

from db_core.database import engine, SessionLocal
from db_core.models import Notification, Campaign, SystemAlert


def observe():
    """Phase 1: Gather current business state from database."""
    observations = {}

    with engine.connect() as conn:
        # Revenue trend
        rev = conn.execute(text("""
            SELECT DATE_TRUNC('month', order_purchase_timestamp::timestamp) as month,
                   SUM(oi.price + oi.freight_value) as revenue
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.order_status = 'delivered'
            GROUP BY month ORDER BY month DESC LIMIT 3
        """)).fetchall()

        if len(rev) >= 2:
            current = float(rev[0][1]) if rev[0][1] else 0
            previous = float(rev[1][1]) if rev[1][1] else 1
            observations["revenue_trend"] = {
                "current_month": round(current, 2),
                "previous_month": round(previous, 2),
                "change_pct": round((current - previous) / max(previous, 1) * 100, 1)
            }

        # Churn risk
        churn = conn.execute(text("""
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN "Churn_Probability" > 0.7 THEN 1 ELSE 0 END) as high_risk,
                ROUND(AVG("Churn_Probability")::numeric, 3) as avg_prob,
                ROUND(AVG("SatisfactionScore")::numeric, 1) as avg_satisfaction
            FROM customer_churn
            WHERE "Churn_Probability" IS NOT NULL
        """)).fetchone()

        if churn:
            observations["churn_status"] = {
                "total_analyzed": churn[0],
                "high_risk_count": churn[1],
                "avg_probability": float(churn[2]) if churn[2] else 0,
                "avg_satisfaction": float(churn[3]) if churn[3] else 0
            }

        # Top declining categories
        categories = conn.execute(text("""
            SELECT p.product_category_name, COUNT(*) as order_count
            FROM order_items oi
            JOIN products p ON p.product_id = oi.product_id
            JOIN orders o ON o.order_id = oi.order_id
            WHERE p.product_category_name IS NOT NULL
              AND o.order_status = 'delivered'
            GROUP BY p.product_category_name
            ORDER BY order_count DESC
            LIMIT 10
        """)).fetchall()

        observations["top_categories"] = [
            {"name": r[0], "orders": r[1]} for r in categories
        ]

        # Review anomalies
        reviews = conn.execute(text("""
            SELECT ROUND(AVG(review_score)::numeric, 2) as avg_score,
                   COUNT(*) as total_reviews,
                   SUM(CASE WHEN review_score <= 2 THEN 1 ELSE 0 END) as negative_reviews
            FROM reviews
        """)).fetchone()

        if reviews:
            observations["review_health"] = {
                "avg_score": float(reviews[0]) if reviews[0] else 0,
                "total": reviews[1],
                "negative_count": reviews[2],
                "negative_pct": round(reviews[2] / max(reviews[1], 1) * 100, 1)
            }

    return observations


def analyze(observations: dict) -> dict:
    """Phase 2: Analyze observations and identify issues/opportunities."""
    insights = []
    urgency_scores = {}

    # Revenue analysis
    rev = observations.get("revenue_trend", {})
    if rev.get("change_pct", 0) < -10:
        insights.append({
            "type": "revenue_decline",
            "message": f"Revenue declined {abs(rev['change_pct'])}% month-over-month",
            "urgency": "high",
            "data": rev
        })
        urgency_scores["revenue"] = "high"
    elif rev.get("change_pct", 0) > 10:
        insights.append({
            "type": "revenue_growth",
            "message": f"Revenue grew {rev['change_pct']}% — positive trend",
            "urgency": "info",
            "data": rev
        })

    # Churn analysis
    churn = observations.get("churn_status", {})
    high_risk = churn.get("high_risk_count", 0)
    if high_risk > 100:
        insights.append({
            "type": "churn_alert",
            "message": f"{high_risk} customers at high churn risk (>70% probability)",
            "urgency": "high",
            "data": churn
        })
        urgency_scores["churn"] = "high"
    elif high_risk > 50:
        insights.append({
            "type": "churn_warning",
            "message": f"{high_risk} customers at elevated churn risk",
            "urgency": "medium",
            "data": churn
        })

    # Satisfaction analysis
    if churn.get("avg_satisfaction", 5) < 3.0:
        insights.append({
            "type": "satisfaction_low",
            "message": f"Average satisfaction is {churn['avg_satisfaction']}/5 — below threshold",
            "urgency": "high"
        })

    # Review health
    reviews = observations.get("review_health", {})
    if reviews.get("negative_pct", 0) > 20:
        insights.append({
            "type": "review_concern",
            "message": f"{reviews['negative_pct']}% of reviews are negative (score <=2)",
            "urgency": "medium"
        })

    return {
        "insights": insights,
        "urgency_scores": urgency_scores,
        "timestamp": datetime.now().isoformat()
    }


def plan(analysis: dict) -> list:
    """Phase 3: Generate action plans based on analysis."""
    plans = []

    for insight in analysis.get("insights", []):
        if insight["type"] == "churn_alert":
            plans.append({
                "action": "create_campaign",
                "name": f"Retention Campaign - {datetime.now().strftime('%Y-%m-%d')}",
                "segment": "high_churn",
                "discount_pct": 20.0,
                "reason": insight["message"],
                "urgency": "high"
            })
            plans.append({
                "action": "notify",
                "title": "High Churn Alert",
                "message": insight["message"],
                "type": "churn_alert"
            })

        elif insight["type"] == "revenue_decline":
            plans.append({
                "action": "notify",
                "title": "Revenue Decline Detected",
                "message": f"{insight['message']}. Consider promotional campaigns.",
                "type": "revenue_alert"
            })
            plans.append({
                "action": "create_campaign",
                "name": f"Revenue Boost - {datetime.now().strftime('%Y-%m-%d')}",
                "segment": "all_customers",
                "discount_pct": 10.0,
                "reason": insight["message"],
                "urgency": "medium"
            })

        elif insight["type"] == "satisfaction_low":
            plans.append({
                "action": "notify",
                "title": "Customer Satisfaction Alert",
                "message": insight["message"],
                "type": "satisfaction_alert"
            })

    return plans


def act(plans: list):
    """Phase 4: Execute action plans (with Human-in-the-Loop for campaigns)."""
    session = SessionLocal()
    actions_taken = []

    try:
        for p in plans[:5]:  # Max 5 actions per cycle
            if p["action"] == "notify":
                notif = Notification(
                    type=p.get("type", "ai_insight"),
                    title=p["title"],
                    message=p["message"],
                    user_id=None  # Broadcast
                )
                session.add(notif)
                actions_taken.append(f"Notification: {p['title']}")

            elif p["action"] == "create_campaign":
                campaign = Campaign(
                    name=p["name"],
                    segment_target=p["segment"],
                    discount_pct=p["discount_pct"],
                    status="draft"  # Human must approve!
                )
                session.add(campaign)
                actions_taken.append(f"Campaign draft: {p['name']} (needs approval)")

                # Also notify about the draft campaign
                notif = Notification(
                    type="campaign_suggestion",
                    title=f"AI Suggests: {p['name']}",
                    message=(
                        f"Reason: {p.get('reason', 'Business optimization')}. "
                        f"Discount: {p['discount_pct']}% for segment '{p['segment']}'. "
                        f"Awaiting approval."
                    ),
                    user_id=None
                )
                session.add(notif)

        session.commit()
    except Exception as e:
        session.rollback()
        actions_taken.append(f"Error: {str(e)}")
    finally:
        session.close()

    return actions_taken


def log_cycle(observations, analysis, plans, actions):
    """Phase 5: Log the autonomous cycle for audit trail."""
    cycle_log = {
        "timestamp": datetime.now().isoformat(),
        "observations_summary": {
            "revenue_change": observations.get("revenue_trend", {}).get("change_pct"),
            "high_risk_customers": observations.get("churn_status", {}).get("high_risk_count"),
            "avg_satisfaction": observations.get("churn_status", {}).get("avg_satisfaction"),
        },
        "insights_count": len(analysis.get("insights", [])),
        "plans_count": len(plans),
        "actions_taken": actions
    }

    # Store in system_alerts as audit log
    session = SessionLocal()
    try:
        alert = SystemAlert(
            Type="AutonomousCycle",
            Message=json.dumps(cycle_log),
            Severity="Info"
        )
        session.add(alert)
        session.commit()
    except Exception:
        session.rollback()
    finally:
        session.close()

    return cycle_log


def run_autonomous_cycle():
    """Execute full Observe -> Analyze -> Plan -> Act cycle."""
    print("\n" + "=" * 60)
    print("AUTONOMOUS AI CYCLE")
    print("=" * 60)

    print("\n[1/5] Observing business state...")
    observations = observe()
    print(f"  Revenue trend: {observations.get('revenue_trend', {}).get('change_pct', 'N/A')}%")
    print(f"  High-risk customers: {observations.get('churn_status', {}).get('high_risk_count', 0)}")

    print("\n[2/5] Analyzing observations...")
    analysis = analyze(observations)
    print(f"  Found {len(analysis['insights'])} insights")

    print("\n[3/5] Planning actions...")
    plans = plan(analysis)
    print(f"  Generated {len(plans)} action plans")

    print("\n[4/5] Executing actions (HITL for campaigns)...")
    actions = act(plans)
    for a in actions:
        print(f"  > {a}")

    print("\n[5/5] Logging cycle...")
    cycle_log = log_cycle(observations, analysis, plans, actions)

    print(f"\n{'=' * 60}")
    print(f"AUTONOMOUS CYCLE COMPLETE - {len(actions)} actions taken")
    print(f"{'=' * 60}")

    return cycle_log
