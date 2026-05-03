import os
import sys
from typing import Any, List, Dict
from sqlalchemy import text
from langchain_core.tools import tool

# Add project root to sys.path to find local packages
sys.path.append(os.path.join(os.path.dirname(__file__), "../../db-core"))
from db_core import engine

@tool
def northwind_query_tool(query: str) -> str:
    """
    Execute a read-only SQL query on the Northwind database.
    Only SELECT statements are allowed. Input should be a valid SQL string.
    Use this for complex queries involving multiple tables (orders, customers, products, etc.)
    IMPORTANT: PostgreSQL is case-sensitive for column names. 
    Use double quotes for columns like "CustomerID", "OrderID", "CompanyName", etc.
    Example: SELECT * FROM customers WHERE "CustomerID" = 'ALFKI'
    """
    query_upper = query.strip().upper()
    if not query_upper.startswith("SELECT"):
        return "Error: Only SELECT queries are allowed for security reasons."
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(query))
            rows = [dict(row._mapping) for row in result]
            return str(rows) if rows else "No results found."
    except Exception as e:
        return f"Error executing query: {str(e)}"

@tool
def get_customer_orders(customer_id: str) -> str:
    """
    Get all orders for a specific customer ID from the ERP system.
    Example customer_id: 'ALFKI', 'ANATR'.
    """
    query = f"SELECT * FROM orders WHERE \"CustomerID\" = '{customer_id}'"
    return northwind_query_tool.invoke(query)

@tool
def analyze_customer_behavior(customer_id: int) -> str:
    """
    Get behavioral data for a customer from the CRM/Behavior database.
    Input should be a numeric Customer ID (e.g., 1, 2, 3...).
    Returns data like Age, Gender, Total Spend, Satisfaction Level.
    """
    query = f"SELECT * FROM customer_behavior WHERE \"CustomerID\" = {customer_id}"
    try:
        with engine.connect() as conn:
            result = conn.execute(text(query))
            rows = [dict(row._mapping) for row in result]
            return str(rows) if rows else "No behavioral data found for this customer ID."
    except Exception as e:
        return f"Error querying behavior: {str(e)}"

from langchain_google_genai import GoogleGenerativeAIEmbeddings

@tool
def behavior_vector_search(query: str, limit: int = 5) -> str:
    """
    Search for customers with similar behaviors based on a natural language query.
    Example: "Find customers who spend a lot but haven't visited in a while."
    """
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    query_vector = embeddings.embed_query(query)
    
    # PostgreSQL pgvector cosine similarity search
    sql = text(f"""
        SELECT "CustomerID", "Gender", "Age", "Annual Income (k$)", "Spending Score (1-100)"
        FROM customer_behavior
        ORDER BY embedding <=> :vector
        LIMIT :limit
    """)
    
    try:
        with engine.connect() as conn:
            result = conn.execute(sql, {"vector": str(query_vector), "limit": limit})
            rows = [dict(row._mapping) for row in result]
            return str(rows) if rows else "No similar behaviors found. Make sure data is embedded."
    except Exception as e:
        return f"Error in vector search: {str(e)}"

