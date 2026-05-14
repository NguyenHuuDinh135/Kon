import os
import sys
import json
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Optional
from datetime import datetime
import uuid
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response

# Add project root to sys.path to find local packages
sys.path.insert(0, os.path.dirname(__file__))
sys.path.append(os.path.join(os.path.dirname(__file__), "../../packages/db-core"))
sys.path.append(os.path.join(os.path.dirname(__file__), "../../packages/shared"))
sys.path.append(os.path.join(os.path.dirname(__file__), "../../packages/ai-engine"))

from db_core import get_db
from db_core.database import engine
from db_core.models import Customer, Order, OrderItem, User, Product
from shared import (
    Customer as SharedCustomer,
    Product as SharedProduct,
    Order as SharedOrder,
)
from ai_engine.agent import run_agent, stream_agent
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user, require_admin

from routers.auth import router as auth_router
from routers.predictions import router as predictions_router
from routers.analytics import router as analytics_router
from routers.notifications import router as notifications_router
from routers.campaigns import router as campaigns_router
from routers.search import router as search_router

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Kon AI ERP & CRM API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add CORS middleware
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(predictions_router, tags=["predictions"])
app.include_router(analytics_router, tags=["analytics"])
app.include_router(notifications_router)
app.include_router(campaigns_router)
app.include_router(search_router)


@app.get("/")
@limiter.limit("60/minute")
def read_root(request: Request):
    return {"message": "Welcome to Kon AI API", "status": "running"}


@app.get("/health")
@limiter.limit("60/minute")
def health_check(request: Request):
    return {"status": "healthy"}


@app.get("/health/detailed")
async def detailed_health():
    """Detailed health check with dependency status."""
    checks = {}

    # Database check
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        checks["database"] = {"status": "healthy"}
    except Exception as e:
        checks["database"] = {"status": "unhealthy", "error": str(e)}

    # Check table counts
    try:
        with engine.connect() as conn:
            orders_count = conn.execute(text("SELECT COUNT(*) FROM orders")).scalar()
            churn_count = conn.execute(text("SELECT COUNT(*) FROM customer_churn")).scalar()
        checks["data"] = {
            "orders": orders_count,
            "churn_customers": churn_count,
            "status": "loaded" if orders_count > 0 else "empty",
        }
    except Exception:
        checks["data"] = {"status": "unknown"}

    overall = "healthy" if all(c.get("status") != "unhealthy" for c in checks.values()) else "degraded"
    return {"status": overall, "checks": checks}


# --- PRODUCT CRUD ---


@app.get("/products", response_model=List[SharedProduct])
def get_products(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    search: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if category:
        query = query.filter(Product.product_category_name == category)
    if search:
        query = query.filter(Product.product_category_name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()


@app.get("/products/{product_id}", response_model=SharedProduct)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


class ProductCreate(BaseModel):
    product_category_name: str
    product_weight_g: Optional[float] = None
    product_length_cm: Optional[float] = None
    product_height_cm: Optional[float] = None
    product_width_cm: Optional[float] = None
    product_photos_qty: Optional[int] = None


@app.post("/products")
@limiter.limit("30/minute")
def create_product(request: Request, product_data: ProductCreate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    new_product = Product(
        product_id=str(uuid.uuid4()),
        product_category_name=product_data.product_category_name,
        product_weight_g=product_data.product_weight_g,
        product_length_cm=product_data.product_length_cm,
        product_height_cm=product_data.product_height_cm,
        product_width_cm=product_data.product_width_cm,
        product_photos_qty=product_data.product_photos_qty,
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {"product_id": new_product.product_id, "product_category_name": new_product.product_category_name}


@app.put("/products/{product_id}")
@limiter.limit("30/minute")
def update_product(request: Request, product_id: str, product_data: ProductCreate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.product_category_name = product_data.product_category_name
    if product_data.product_weight_g is not None:
        product.product_weight_g = product_data.product_weight_g
    if product_data.product_photos_qty is not None:
        product.product_photos_qty = product_data.product_photos_qty
    if product_data.product_length_cm is not None:
        product.product_length_cm = product_data.product_length_cm
    if product_data.product_height_cm is not None:
        product.product_height_cm = product_data.product_height_cm
    if product_data.product_width_cm is not None:
        product.product_width_cm = product_data.product_width_cm
    db.commit()
    db.refresh(product)
    return {"product_id": product.product_id, "product_category_name": product.product_category_name}


@app.delete("/products/{product_id}")
def delete_product(product_id: str, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.product_id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}


# --- CUSTOMER CRUD ---


@app.get("/customers", response_model=List[SharedCustomer])
def get_customers(
    skip: int = 0,
    limit: int = 100,
    state: str = None,
    city: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Customer)
    if state:
        query = query.filter(Customer.customer_state == state)
    if city:
        query = query.filter(Customer.customer_city == city)
    return query.offset(skip).limit(limit).all()


@app.get("/customers/{customer_id}", response_model=SharedCustomer)
def get_customer(customer_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


# --- ORDER CRUD ---


@app.get("/orders", response_model=List[SharedOrder])
def get_orders(
    skip: int = 0,
    limit: int = 100,
    status_filter: str = None,
    customer_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Order)
    if status_filter:
        query = query.filter(Order.order_status == status_filter)
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    return query.order_by(Order.order_purchase_timestamp.desc()).offset(skip).limit(limit).all()


@app.post("/orders")
def create_order(order_data: Dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create an order with order items (Olist schema)."""
    import uuid

    order_id = order_data.get("order_id", str(uuid.uuid4()))
    new_order = Order(
        order_id=order_id,
        customer_id=order_data.get("customer_id"),
        order_status=order_data.get("order_status", "created"),
        order_purchase_timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    )
    db.add(new_order)
    db.flush()

    for idx, item in enumerate(order_data.get("items", []), start=1):
        order_item = OrderItem(
            order_id=order_id,
            order_item_id=idx,
            product_id=item.get("product_id"),
            seller_id=item.get("seller_id"),
            price=item.get("price", 0.0),
            freight_value=item.get("freight_value", 0.0),
        )
        db.add(order_item)

    db.commit()
    return {"message": "Order created", "order_id": order_id}


# --- MISC ENDPOINTS ---


class AgentRequest(BaseModel):
    prompt: str = Field(max_length=2000)


@app.post("/agent/run")
@limiter.limit("10/minute")
def trigger_agent(request: Request, body: AgentRequest, current_user: User = Depends(get_current_user)):
    try:
        result = run_agent(body.prompt)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agent/stream")
@limiter.limit("10/minute")
def stream_agent_endpoint(request: Request, body: AgentRequest, current_user: User = Depends(get_current_user)):
    def event_generator():
        try:
            for event in stream_agent(body.prompt):
                yield f"data: {json.dumps(event)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
