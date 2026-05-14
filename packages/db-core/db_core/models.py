from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, JSON, Text, Sequence
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from .database import Base


# ==================== AUTH & SYSTEM ====================

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="client")
    is_active = Column(Boolean, default=True)
    failed_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    CreatedAt = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("users.id"), nullable=True)
    Action = Column(String)
    Table = Column(String)
    RecordID = Column(String)
    Timestamp = Column(DateTime(timezone=True), server_default=func.now())
    Details = Column(JSON, nullable=True)


class SystemAlert(Base):
    __tablename__ = "system_alerts"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Type = Column(String)
    Message = Column(String)
    Severity = Column(String)
    IsRead = Column(Boolean, default=False)
    CreatedAt = Column(DateTime(timezone=True), server_default=func.now())
    RelatedID = Column(String, nullable=True)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    type = Column(String)
    title = Column(String)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ==================== OLIST ERP (Main Dataset) ====================

class Customer(Base):
    __tablename__ = "customers"
    customer_id = Column(String, primary_key=True, index=True)
    customer_unique_id = Column(String, index=True)
    customer_zip_code_prefix = Column(String)
    customer_city = Column(String)
    customer_state = Column(String)


class Order(Base):
    __tablename__ = "orders"
    order_id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, index=True)
    order_status = Column(String)
    order_purchase_timestamp = Column(String)
    order_approved_at = Column(String, nullable=True)
    order_delivered_carrier_date = Column(String, nullable=True)
    order_delivered_customer_date = Column(String, nullable=True)
    order_estimated_delivery_date = Column(String, nullable=True)


class OrderItem(Base):
    __tablename__ = "order_items"
    order_id = Column(String, primary_key=True)
    order_item_id = Column(Integer, primary_key=True)
    product_id = Column(String, index=True)
    seller_id = Column(String, index=True)
    shipping_limit_date = Column(String, nullable=True)
    price = Column(Float)
    freight_value = Column(Float)


class Payment(Base):
    __tablename__ = "payments"
    order_id = Column(String, primary_key=True)
    payment_sequential = Column(Integer, primary_key=True)
    payment_type = Column(String)
    payment_installments = Column(Integer)
    payment_value = Column(Float)


class Review(Base):
    __tablename__ = "reviews"
    review_id = Column(String, primary_key=True)
    order_id = Column(String, index=True)
    review_score = Column(Integer)
    review_comment_title = Column(Text, nullable=True)
    review_comment_message = Column(Text, nullable=True)
    review_creation_date = Column(String, nullable=True)
    review_answer_timestamp = Column(String, nullable=True)


class Product(Base):
    __tablename__ = "products"
    product_id = Column(String, primary_key=True, index=True)
    product_category_name = Column(String, nullable=True)
    product_name_lenght = Column(Float, nullable=True)
    product_description_lenght = Column(Float, nullable=True)
    product_photos_qty = Column(Float, nullable=True)
    product_weight_g = Column(Float, nullable=True)
    product_length_cm = Column(Float, nullable=True)
    product_height_cm = Column(Float, nullable=True)
    product_width_cm = Column(Float, nullable=True)


class Seller(Base):
    __tablename__ = "sellers"
    seller_id = Column(String, primary_key=True, index=True)
    seller_zip_code_prefix = Column(String)
    seller_city = Column(String)
    seller_state = Column(String)


class CategoryTranslation(Base):
    __tablename__ = "category_translation"
    product_category_name = Column(String, primary_key=True)
    product_category_name_english = Column(String)


# ==================== ONLINE RETAIL (Satellite 1 - RFM) ====================

class OnlineRetailTransaction(Base):
    __tablename__ = "online_retail"
    InvoiceNo = Column(String, primary_key=True)
    StockCode = Column(String, primary_key=True)
    Description = Column(Text, nullable=True)
    Quantity = Column(Integer)
    InvoiceDate = Column(DateTime)
    UnitPrice = Column(Float)
    CustomerID = Column(Integer, index=True)
    Country = Column(String)
    TotalAmount = Column(Float)


# ==================== E-COMMERCE CHURN (Satellite 2 - Labels) ====================

class CustomerChurn(Base):
    __tablename__ = "customer_churn"
    CustomerID = Column(Integer, primary_key=True, index=True)
    Churn = Column(Integer)  # 0 or 1 — REAL label
    Tenure = Column(Float, nullable=True)
    PreferredLoginDevice = Column(String, nullable=True)
    CityTier = Column(Integer, nullable=True)
    WarehouseToHome = Column(Float, nullable=True)
    PreferredPaymentMode = Column(String, nullable=True)
    Gender = Column(String, nullable=True)
    HourSpendOnApp = Column(Float, nullable=True)
    NumberOfDeviceRegistered = Column(Integer, nullable=True)
    PreferedOrderCat = Column(String, nullable=True)
    SatisfactionScore = Column(Integer, nullable=True)
    MaritalStatus = Column(String, nullable=True)
    NumberOfAddress = Column(Integer, nullable=True)
    Complain = Column(Integer, nullable=True)
    OrderAmountHikeFromlastYear = Column(Float, nullable=True)
    CouponUsed = Column(Float, nullable=True)
    OrderCount = Column(Float, nullable=True)
    DaySinceLastOrder = Column(Float, nullable=True)
    CashbackAmount = Column(Float, nullable=True)
    embedding = Column(Vector(1024), nullable=True)


# ==================== ML RESULTS ====================

class MLRecommendation(Base):
    __tablename__ = "ml_recommendations"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    CustomerID = Column(String, index=True)
    RecommendedProducts = Column(JSON)
    Score = Column(Float)
    CreatedAt = Column(DateTime(timezone=True), server_default=func.now())


class MLModelMetrics(Base):
    __tablename__ = "ml_model_metrics"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    model_name = Column(String(100))
    accuracy = Column(Float, nullable=True)
    precision_score = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    parameters = Column(JSON, nullable=True)
    trained_at = Column(DateTime(timezone=True), server_default=func.now())


class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String)
    segment_target = Column(String)
    discount_pct = Column(Float)
    status = Column(String, default="draft")  # draft, approved, executed
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    executed_at = Column(DateTime, nullable=True)
