import os
import re
import sys
from sqlalchemy import text
from langchain_core.tools import tool

# Add project root to sys.path to find local packages
sys.path.append(os.path.join(os.path.dirname(__file__), "../../db-core"))
from db_core import engine


@tool
def query_database(query: str) -> str:
    """Execute a read-only SQL query on the e-commerce database.
    Available tables: orders, order_items, products, customers, sellers, payments, reviews,
    online_retail, customer_churn, customer_segments, ml_model_metrics.
    Only SELECT statements are allowed."""
    query_upper = query.strip().upper()
    if not query_upper.startswith("SELECT"):
        return "Error: Only SELECT queries are allowed."
    if len(query) > 2000:
        return "Error: Query exceeds maximum length of 2000 characters."
    if ";" in query:
        return "Error: Multi-statement queries are not allowed."
    dangerous_keywords = r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT)\b"
    if re.search(dangerous_keywords, query, re.IGNORECASE):
        return "Error: Query contains forbidden keywords. Only SELECT queries are allowed."
    try:
        with engine.connect() as conn:
            result = conn.execute(text(query))
            rows = result.fetchmany(50)
            if not rows:
                return "No results found."
            columns = result.keys()
            formatted = [dict(zip(columns, row)) for row in rows]
            return str(formatted[:20])
    except Exception as e:
        return f"Query error: {str(e)}"


@tool
def get_customer_profile(customer_id: int) -> str:
    """Get a complete customer profile including churn risk, engagement, and behavior.
    Use integer customer IDs from the customer_churn table (1-5630)."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT "CustomerID", "Churn", "Tenure", "PreferredLoginDevice",
                       "CityTier", "WarehouseToHome", "PreferredPaymentMode",
                       "Gender", "HourSpendOnApp", "NumberOfDeviceRegistered",
                       "PreferedOrderCat", "SatisfactionScore", "MaritalStatus",
                       "NumberOfAddress", "Complain", "OrderAmountHikeFromlastYear",
                       "CouponUsed", "OrderCount", "DaySinceLastOrder", "CashbackAmount",
                       "Churn_Prediction", "Churn_Probability", "DT_Label", "Cluster"
                FROM customer_churn
                WHERE "CustomerID" = :cid
            """), {"cid": customer_id})
            row = result.fetchone()
            if not row:
                return f"Customer {customer_id} not found."
            profile = dict(zip(result.keys(), row))

            # Interpret churn risk level
            prob = profile.get('Churn_Probability') or 0
            risk = "HIGH" if prob > 0.7 else "MEDIUM" if prob > 0.3 else "LOW"
            return f"""Customer {customer_id} Profile:
- Churn Status: {'CHURNED' if profile.get('Churn') == 1 else 'ACTIVE'}
- Churn Probability: {profile.get('Churn_Probability', 'N/A')} ({risk} risk)
- Tenure: {profile.get('Tenure')} months
- Satisfaction: {profile.get('SatisfactionScore')}/5
- Orders: {profile.get('OrderCount')}, Last order: {profile.get('DaySinceLastOrder')} days ago
- Preferred: {profile.get('PreferedOrderCat')} via {profile.get('PreferredPaymentMode')}
- Segment: {profile.get('DT_Label') or 'N/A'} | Cluster: {profile.get('Cluster') or 'N/A'}
- Complaint filed: {'Yes' if profile.get('Complain') == 1 else 'No'}
- Cashback avg: ${profile.get('CashbackAmount', 0):.0f}"""
    except Exception as e:
        return f"Error: {str(e)}"


@tool
def get_churn_risk_summary() -> str:
    """Get a summary of customer churn risk levels across the entire customer base."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN "Churn" = 1 THEN 1 ELSE 0 END) as churned,
                    SUM(CASE WHEN "Churn_Probability" > 0.7 THEN 1 ELSE 0 END) as high_risk,
                    SUM(CASE WHEN "Churn_Probability" BETWEEN 0.3 AND 0.7 THEN 1 ELSE 0 END) as medium_risk,
                    SUM(CASE WHEN "Churn_Probability" < 0.3 THEN 1 ELSE 0 END) as low_risk,
                    ROUND(AVG("Churn_Probability")::numeric, 3) as avg_probability,
                    ROUND(AVG("SatisfactionScore")::numeric, 1) as avg_satisfaction
                FROM customer_churn
                WHERE "Churn_Probability" IS NOT NULL
            """))
            row = result.fetchone()
            if not row:
                return "No churn data available."
            data = dict(zip(result.keys(), row))
            return f"""Churn Risk Summary:
- Total customers analyzed: {data['total']}
- Already churned: {data['churned']} ({data['churned']*100//data['total']}%)
- HIGH risk (>70%): {data['high_risk']} customers
- MEDIUM risk (30-70%): {data['medium_risk']} customers
- LOW risk (<30%): {data['low_risk']} customers
- Average churn probability: {data['avg_probability']}
- Average satisfaction: {data['avg_satisfaction']}/5"""
    except Exception as e:
        return f"Error: {str(e)}"


@tool
def get_product_recommendations(customer_id: str) -> str:
    """Get product recommendations for a customer based on collaborative filtering.
    Uses Olist order history to find products commonly bought by similar customers.
    Pass the Olist customer_id (string format)."""
    try:
        with engine.connect() as conn:
            # Get products this customer bought
            bought = conn.execute(text("""
                SELECT DISTINCT oi.product_id
                FROM order_items oi
                JOIN orders o ON o.order_id = oi.order_id
                WHERE o.customer_id = :cid
            """), {"cid": customer_id}).fetchall()

            if not bought:
                # Cold start: recommend popular products
                popular = conn.execute(text("""
                    SELECT p.product_category_name, COUNT(*) as sales
                    FROM order_items oi
                    JOIN products p ON p.product_id = oi.product_id
                    WHERE p.product_category_name IS NOT NULL
                    GROUP BY p.product_category_name
                    ORDER BY sales DESC LIMIT 5
                """)).fetchall()
                cats = [r[0] for r in popular]
                return f"New customer — recommending top categories: {', '.join(cats)}"

            bought_ids = [r[0] for r in bought]

            # Find customers who bought the same products
            similar_products = conn.execute(text("""
                SELECT oi2.product_id, p.product_category_name, COUNT(*) as co_purchase_count
                FROM order_items oi1
                JOIN orders o1 ON o1.order_id = oi1.order_id
                JOIN orders o2 ON o2.customer_id != :cid
                JOIN order_items oi2 ON oi2.order_id = o2.order_id
                JOIN products p ON p.product_id = oi2.product_id
                WHERE oi1.product_id = ANY(:bought)
                  AND oi2.product_id != ALL(:bought)
                  AND p.product_category_name IS NOT NULL
                GROUP BY oi2.product_id, p.product_category_name
                ORDER BY co_purchase_count DESC
                LIMIT 5
            """), {"cid": customer_id, "bought": bought_ids}).fetchall()

            if not similar_products:
                return "Not enough purchase history for collaborative filtering."

            recs = [f"- {r[1]} (co-purchased {r[2]} times)" for r in similar_products]
            return f"Recommendations for customer {customer_id}:\n" + "\n".join(recs)
    except Exception as e:
        return f"Error: {str(e)}"


@tool
def get_revenue_insights() -> str:
    """Get current revenue insights including trends, top categories, and forecasts."""
    try:
        with engine.connect() as conn:
            # Monthly revenue trend (last 6 months of data)
            revenue = conn.execute(text("""
                SELECT DATE_TRUNC('month', o.order_purchase_timestamp::timestamp) as month,
                       SUM(oi.price + oi.freight_value) as revenue,
                       COUNT(DISTINCT o.order_id) as orders
                FROM orders o
                JOIN order_items oi ON o.order_id = oi.order_id
                WHERE o.order_status = 'delivered'
                GROUP BY month
                ORDER BY month DESC
                LIMIT 6
            """)).fetchall()

            # Top categories
            categories = conn.execute(text("""
                SELECT p.product_category_name,
                       SUM(oi.price) as revenue,
                       COUNT(*) as items_sold
                FROM order_items oi
                JOIN products p ON p.product_id = oi.product_id
                WHERE p.product_category_name IS NOT NULL
                GROUP BY p.product_category_name
                ORDER BY revenue DESC
                LIMIT 5
            """)).fetchall()

            rev_lines = [
                f"  {r[0].strftime('%Y-%m') if hasattr(r[0], 'strftime') else r[0]}: "
                f"R${r[1]:,.0f} ({r[2]} orders)"
                for r in revenue[:6]
            ]
            cat_lines = [f"  {r[0]}: R${r[1]:,.0f} ({r[2]} items)" for r in categories]

            return f"""Revenue Insights:

Monthly Trend (recent):
{chr(10).join(rev_lines)}

Top Categories:
{chr(10).join(cat_lines)}"""
    except Exception as e:
        return f"Error: {str(e)}"


@tool
def suggest_campaign(segment: str = "high_churn") -> str:
    """Suggest a marketing campaign based on customer segment analysis.
    Segments: 'high_churn', 'vip', 'at_risk', 'new_customers', 'low_engagement'."""
    try:
        with engine.connect() as conn:
            if segment == "high_churn":
                data = conn.execute(text("""
                    SELECT COUNT(*) as count,
                           ROUND(AVG("CashbackAmount")::numeric, 0) as avg_cashback,
                           ROUND(AVG("DaySinceLastOrder")::numeric, 0) as avg_days
                    FROM customer_churn
                    WHERE "Churn_Probability" > 0.7
                """)).fetchone()
                return f"""Campaign Suggestion: RETENTION for High-Churn Customers
- Target: {data[0]} customers with >70% churn probability
- Insight: Average {data[2]} days since last order, avg cashback ${data[1]}
- Recommendation: Offer 20% discount + free shipping for next order
- Channel: Email + Push notification
- Urgency: HIGH — these customers are about to leave
- Expected impact: Recover 15-25% of at-risk customers"""

            elif segment == "vip":
                data = conn.execute(text("""
                    SELECT COUNT(*) as count,
                           ROUND(AVG("OrderCount")::numeric, 1) as avg_orders
                    FROM customer_churn
                    WHERE "Churn_Probability" < 0.2 AND "OrderCount" > 5
                """)).fetchone()
                return f"""Campaign Suggestion: LOYALTY REWARD for VIP Customers
- Target: {data[0]} customers with high engagement + low churn risk
- Avg orders: {data[1]} per customer
- Recommendation: Exclusive early access + loyalty cashback boost (5% extra)
- Channel: Personalized email
- Goal: Increase order frequency by 10%"""

            else:
                return (
                    f"Segment '{segment}' analysis: Use query_database to explore "
                    f"customer_churn table for custom segmentation."
                )
    except Exception as e:
        return f"Error: {str(e)}"


@tool
def search_similar_customers(description: str, limit: int = 5) -> str:
    """Find customers matching a natural language description using semantic search.
    Example: 'customers who spend a lot but haven't ordered recently'"""
    try:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
    except ImportError:
        return "langchain-google-genai not installed. Vector search unavailable."

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return "GOOGLE_API_KEY not configured for vector search."

    try:
        embeddings_model = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=api_key
        )
        query_vector = embeddings_model.embed_query(description)

        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT "CustomerID", "Gender", "Tenure", "SatisfactionScore",
                       "OrderCount", "DaySinceLastOrder", "CashbackAmount",
                       "PreferedOrderCat", "Churn_Probability"
                FROM customer_churn
                WHERE embedding IS NOT NULL
                ORDER BY embedding <=> :vector
                LIMIT :lim
            """), {"vector": str(query_vector), "lim": limit})

            rows = result.fetchall()
            if not rows:
                return "No embedded customers found. Run embedding generation first."

            lines = []
            for r in rows:
                prob = f"{r[8]*100:.0f}%" if r[8] else "N/A"
                lines.append(
                    f"  #{r[0]}: {r[1]}, {r[2]}mo tenure, {r[4]} orders, "
                    f"last {r[5]}d ago, satisfaction {r[3]}/5, churn {prob}"
                )
            return f"Top {limit} matching customers:\n" + "\n".join(lines)
    except Exception as e:
        return f"Vector search error: {str(e)}"
