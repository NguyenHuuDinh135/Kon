import os
import sys
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List, Dict
import pandas as pd
from datetime import datetime, timedelta

# Add project root to sys.path to find local packages
sys.path.append(os.path.join(os.path.dirname(__file__), "../../packages/db-core"))
sys.path.append(os.path.join(os.path.dirname(__file__), "../../packages/shared"))
sys.path.append(os.path.join(os.path.dirname(__file__), "../../packages/ai-engine"))

from db_core import get_db, engine
from db_core.models import Customer, Order, CustomerBehavior, SystemAlert, MLRecommendation
from shared import (
    Customer as SharedCustomer, 
    DashboardKPIs, 
    SystemAlert as SharedAlert,
    Recommendation as SharedRecommendation
)
from ai_engine.agent import run_agent
from mcp_servers.tools import behavior_vector_search
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Kon AI ERP & CRM API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Kon AI API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from auth import (
    create_access_token, 
    get_current_user, 
    require_admin,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from db_core.models import (
    Customer, Order, CustomerBehavior, SystemAlert, MLRecommendation,
    User, Product, Category, OrderDetail, AuditLog
)
from shared import (
    Customer as SharedCustomer, 
    DashboardKPIs, 
    SystemAlert as SharedAlert,
    Recommendation as SharedRecommendation,
    UserCreate, User as SharedUser, Token,
    Product as SharedProduct, ProductCreate,
    Order as SharedOrder
)

# Auth helper (inlined or imported if we moved it)
def authenticate_user(db: Session, username: str, password: str):
    from auth import verify_password
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

# --- AUTH ENDPOINTS ---

@app.post("/auth/register", response_model=SharedUser)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_pwd = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pwd,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=SharedUser)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# --- PRODUCT CRUD ---

@app.get("/products", response_model=List[SharedProduct])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Product).offset(skip).limit(limit).all()

@app.get("/products/{product_id}", response_model=SharedProduct)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.ProductID == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products", response_model=SharedProduct)
def create_product(product: ProductCreate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/products/{product_id}", response_model=SharedProduct)
def update_product(product_id: int, product: ProductCreate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.ProductID == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.ProductID == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}

# --- PROTECTED ANALYTICS ---

@app.get("/dashboard/kpis", response_model=DashboardKPIs)
def get_dashboard_kpis(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    # Accurate revenue from order details
    total_revenue = db.query(
        func.sum(OrderDetail.UnitPrice * OrderDetail.Quantity * (1 - OrderDetail.Discount))
    ).scalar() or 0.0

    churn_alerts_count = db.query(SystemAlert).filter(SystemAlert.Type == "Churn", SystemAlert.IsRead == False).count()
    avg_churn_risk = db.query(func.avg(CustomerBehavior.Churn_Risk)).scalar() or 0.0

    return {
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "churn_alerts_count": churn_alerts_count,
        "avg_churn_risk": round(avg_churn_risk, 2)
    }
@app.get("/dashboard/revenue-over-time")
def get_revenue_over_time(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Monthly revenue for line charts."""
    query = """
    SELECT 
        DATE_TRUNC('month', TO_DATE(o."orderDate", 'YYYY-MM-DD')) as month,
        SUM(od."unitPrice" * od."quantity" * (1 - od."discount")) as revenue
    FROM orders o
    JOIN order_details od ON o."orderID" = od."orderID"
    GROUP BY month
    ORDER BY month ASC
    """

    df = pd.read_sql(query, engine)
    df['month'] = df['month'].dt.strftime('%Y-%m')
    return df.to_dict(orient='records')

@app.get("/dashboard/segmentation-stats")
def get_segmentation_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Customer count per K-Means cluster for pie charts."""
    query = """
    SELECT "Cluster", COUNT(*) as count
    FROM customer_behavior
    GROUP BY "Cluster"
    """
    df = pd.read_sql(query, engine)
    return df.to_dict(orient='records')

@app.get("/dashboard/top-products")
def get_top_products(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Top 5 products for bar charts."""
    query = """
    SELECT p."productName", SUM(od."quantity") as total_sold
    FROM order_details od
    JOIN products p ON od."productID" = p."productID"
    GROUP BY p."productName"
    ORDER BY total_sold DESC
    LIMIT 5
    """
    df = pd.read_sql(query, engine)
    return df.to_dict(orient='records')

@app.get("/alerts", response_model=List[SharedAlert])
def get_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SystemAlert).order_by(SystemAlert.CreatedAt.desc()).limit(50).all()

@app.get("/recommendations/{customer_id}", response_model=List[SharedRecommendation])
def get_recommendations(customer_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(MLRecommendation).filter(MLRecommendation.CustomerID == customer_id).all()

@app.get("/search/behavior")
def search_behavior(query: str, limit: int = 5, current_user: User = Depends(get_current_user)):
    """Semantic search for customer behaviors."""
    try:
        results = behavior_vector_search.invoke({"query": query, "limit": limit})
        return {"query": query, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agent/run")
def trigger_agent(prompt: str, current_user: User = Depends(get_current_user)):
    try:
        result = run_agent(prompt)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- CUSTOMER CRUD ---

@app.get("/customers", response_model=List[SharedCustomer])
def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Customer).offset(skip).limit(limit).all()

@app.get("/customers/{customer_id}", response_model=SharedCustomer)
def get_customer(customer_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customer = db.query(Customer).filter(Customer.CustomerID == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@app.post("/customers", response_model=SharedCustomer)
def create_customer(customer: SharedCustomer, db: Session = Depends(get_db)):
    # This can be used for Shopper registration
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

# --- ORDER CRUD ---

@app.get("/orders", response_model=List[SharedOrder])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Order).offset(skip).limit(limit).all()

@app.post("/orders")
def create_order(order_data: Dict, db: Session = Depends(get_db)):
    """Simplified order creation (Checkout)."""
    # Logic to create Order and OrderDetails
    new_order = Order(
        CustomerID=order_data.get("CustomerID"),
        OrderDate=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        Freight=order_data.get("Freight", 0.0)
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Add OrderDetails if provided
    for item in order_data.get("items", []):
        detail = OrderDetail(
            OrderID=new_order.OrderID,
            ProductID=item["ProductID"],
            UnitPrice=item["UnitPrice"],
            Quantity=item["Quantity"],
            Discount=item.get("Discount", 0.0)
        )
        db.add(detail)
    db.commit()
    
    return {"message": "Order created", "order_id": new_order.OrderID}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
