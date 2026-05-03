import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sqlalchemy import text
from db_core.database import SessionLocal, engine
from db_core.models import CustomerBehavior, MLRecommendation, SystemAlert, Order

def get_rfm_data():
    """Extract RFM (Recency, Frequency, Monetary) data from Northwind orders."""
    query = """
    SELECT 
        "customerID",
        MAX("orderDate") as last_order,
        COUNT("orderID") as frequency,
        SUM("freight") as monetary 
    FROM orders
    GROUP BY "customerID"
    """
    df = pd.read_sql(query, engine)
    if df.empty:
        return df
    df['last_order'] = pd.to_datetime(df['last_order'])
    max_date = df['last_order'].max()
    df['recency'] = (max_date - df['last_order']).dt.days
    return df

def train_customer_segments():
    """Run K-Means clustering on RFM data."""
    df = get_rfm_data()
    if df.empty:
        return df
    features = ['recency', 'frequency', 'monetary']
    X = df[features]
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_predict(X_scaled)
    return df

def predict_churn():
    """Simple churn prediction based on recency."""
    df = get_rfm_data()
    if df.empty:
        return df
    avg_recency = df['recency'].mean()
    df['churn_risk'] = df['recency'].apply(lambda x: min(1.0, x / (max(1, avg_recency) * 3)))
    return df

def generate_recommendations():
    """Simple recommendation engine using 'Frequently Bought Together' logic."""
    query = """
    SELECT "orderID", "productID" FROM order_details
    """
    df = pd.read_sql(query, engine)
    if df.empty:
        return []
    
    # Simple product popularity + order correlation
    # 1. Get top products overall
    top_products = df['productID'].value_counts().head(20).index.tolist()
    
    # 2. Map product names
    prod_query = "SELECT \"productID\", \"productName\" FROM products"
    prod_df = pd.read_sql(prod_query, engine)
    prod_map = dict(zip(prod_df['productID'], prod_df['productName']))
    
    # 3. Get customer last purchases
    cust_query = """
    SELECT o."customerID", od."productID"
    FROM orders o
    JOIN order_details od ON o."orderID" = od."orderID"
    """
    cust_df = pd.read_sql(cust_query, engine)
    
    recommendations = []
    for customer_id in cust_df['customerID'].unique():
        bought = cust_df[cust_df['customerID'] == customer_id]['productID'].tolist()
        # Suggest top products they haven't bought yet
        suggested_ids = [p for p in top_products if p not in bought][:3]
        suggested_names = [prod_map.get(p, f"Product {p}") for p in suggested_ids]
        
        if suggested_names:
            recommendations.append({
                "CustomerID": customer_id,
                "RecommendedProducts": suggested_names,
                "Score": 0.85 # Placeholder confidence score
            })
    return recommendations

def run_all_ml_tasks():
    print("Running Customer Segmentation...")
    segments = train_customer_segments()
    
    print("Running Churn Prediction...")
    churn_risks = predict_churn()

    print("Generating Product Recommendations...")
    recommendations = generate_recommendations()
    
    session = SessionLocal()
    try:
        # Save Churn Alerts
        if isinstance(churn_risks, pd.DataFrame) and not churn_risks.empty:
            high_risk = churn_risks[churn_risks['churn_risk'] > 0.7]
            for _, row in high_risk.iterrows():
                # Avoid duplicate alerts for the same customer in this run
                alert = SystemAlert(
                    Type="Churn",
                    Message=f"Customer {row['customerID']} is at high churn risk (Risk: {row['churn_risk']:.2f})",
                    Severity="High",
                    RelatedID=str(row['customerID'])
                )
                session.add(alert)

        # Save Recommendations
        # Clear old recommendations first
        session.query(MLRecommendation).delete()
        for rec in recommendations:
            obj = MLRecommendation(
                CustomerID=rec['CustomerID'],
                RecommendedProducts=rec['RecommendedProducts'],
                Score=rec['Score']
            )
            session.add(obj)
        
        session.commit()
        print(f"✅ ML tasks completed. Generated {len(recommendations)} recommendations.")
    except Exception as e:
        print(f"❌ Error saving ML results: {e}")
        session.rollback()
    finally:
        session.close()
