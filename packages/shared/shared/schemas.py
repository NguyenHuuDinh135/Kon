from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


# ==================== AUTH ====================

class UserBase(BaseModel):
    username: str
    email: str
    role: Optional[str] = "client"
    is_active: Optional[bool] = True


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class User(UserBase):
    id: int
    CreatedAt: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# ==================== SYSTEM ====================

class SystemAlertBase(BaseModel):
    id: int
    Type: str
    Message: str
    Severity: str
    IsRead: bool
    CreatedAt: datetime
    RelatedID: Optional[str] = None


class SystemAlert(SystemAlertBase):
    class Config:
        from_attributes = True


class NotificationBase(BaseModel):
    type: str
    title: str
    message: str


class Notification(NotificationBase):
    id: int
    user_id: Optional[int] = None
    is_read: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== OLIST ERP ====================

class CustomerBase(BaseModel):
    customer_id: str
    customer_unique_id: Optional[str] = None
    customer_zip_code_prefix: Optional[Any] = None
    customer_city: Optional[str] = None
    customer_state: Optional[str] = None


class Customer(CustomerBase):
    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    order_id: str
    customer_id: Optional[str] = None
    order_status: Optional[str] = None
    order_purchase_timestamp: Optional[str] = None
    order_approved_at: Optional[str] = None
    order_delivered_carrier_date: Optional[str] = None
    order_delivered_customer_date: Optional[str] = None
    order_estimated_delivery_date: Optional[str] = None


class Order(OrderBase):
    class Config:
        from_attributes = True


class OrderItemBase(BaseModel):
    order_id: str
    order_item_id: int
    product_id: Optional[str] = None
    seller_id: Optional[str] = None
    shipping_limit_date: Optional[str] = None
    price: Optional[float] = None
    freight_value: Optional[float] = None


class OrderItem(OrderItemBase):
    class Config:
        from_attributes = True


class PaymentBase(BaseModel):
    order_id: str
    payment_sequential: int
    payment_type: Optional[str] = None
    payment_installments: Optional[int] = None
    payment_value: Optional[float] = None


class Payment(PaymentBase):
    class Config:
        from_attributes = True


class ReviewBase(BaseModel):
    review_id: str
    order_id: Optional[str] = None
    review_score: Optional[int] = None
    review_comment_title: Optional[str] = None
    review_comment_message: Optional[str] = None
    review_creation_date: Optional[str] = None
    review_answer_timestamp: Optional[str] = None


class Review(ReviewBase):
    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    product_id: str
    product_category_name: Optional[str] = None
    product_name_lenght: Optional[float] = None
    product_description_lenght: Optional[float] = None
    product_photos_qty: Optional[float] = None
    product_weight_g: Optional[float] = None
    product_length_cm: Optional[float] = None
    product_height_cm: Optional[float] = None
    product_width_cm: Optional[float] = None


class Product(ProductBase):
    class Config:
        from_attributes = True


class SellerBase(BaseModel):
    seller_id: str
    seller_zip_code_prefix: Optional[Any] = None
    seller_city: Optional[str] = None
    seller_state: Optional[str] = None


class Seller(SellerBase):
    class Config:
        from_attributes = True


class CategoryTranslationBase(BaseModel):
    product_category_name: str
    product_category_name_english: Optional[str] = None


class CategoryTranslation(CategoryTranslationBase):
    class Config:
        from_attributes = True


# ==================== ONLINE RETAIL (Satellite 1) ====================

class OnlineRetailTransactionBase(BaseModel):
    InvoiceNo: str
    StockCode: str
    Description: Optional[str] = None
    Quantity: int
    InvoiceDate: datetime
    UnitPrice: float
    CustomerID: int
    Country: Optional[str] = None
    TotalAmount: Optional[float] = None


class OnlineRetailTransaction(OnlineRetailTransactionBase):
    class Config:
        from_attributes = True


# ==================== CHURN (Satellite 2) ====================

class CustomerChurnBase(BaseModel):
    CustomerID: int
    Churn: Optional[int] = None
    Tenure: Optional[float] = None
    PreferredLoginDevice: Optional[str] = None
    CityTier: Optional[int] = None
    WarehouseToHome: Optional[float] = None
    PreferredPaymentMode: Optional[str] = None
    Gender: Optional[str] = None
    HourSpendOnApp: Optional[float] = None
    NumberOfDeviceRegistered: Optional[int] = None
    PreferedOrderCat: Optional[str] = None
    SatisfactionScore: Optional[int] = None
    MaritalStatus: Optional[str] = None
    NumberOfAddress: Optional[int] = None
    Complain: Optional[int] = None
    OrderAmountHikeFromlastYear: Optional[float] = None
    CouponUsed: Optional[float] = None
    OrderCount: Optional[float] = None
    DaySinceLastOrder: Optional[float] = None
    CashbackAmount: Optional[float] = None


class CustomerChurn(CustomerChurnBase):
    class Config:
        from_attributes = True


# ==================== ML RESULTS ====================

class Recommendation(BaseModel):
    CustomerID: str
    RecommendedProducts: List[str]
    Score: float
    CreatedAt: datetime


class MLModelMetricsBase(BaseModel):
    model_name: str
    accuracy: Optional[float] = None
    precision_score: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    parameters: Optional[Any] = None


class MLModelMetrics(MLModelMetricsBase):
    id: int
    trained_at: datetime

    class Config:
        from_attributes = True


# ==================== CAMPAIGNS ====================

class CampaignCreate(BaseModel):
    name: str
    segment_target: str
    discount_pct: float = Field(ge=0, le=100)


class Campaign(BaseModel):
    id: int
    name: str
    segment_target: str
    discount_pct: float
    status: str
    created_by: Optional[int] = None
    created_at: datetime
    executed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== DASHBOARD ====================

class DashboardKPIs(BaseModel):
    total_customers: int
    total_orders: int
    total_revenue: float
    churn_rate: Optional[float] = None
    avg_satisfaction: Optional[float] = None
    churn_alerts_count: Optional[int] = None
    avg_churn_risk: Optional[float] = None
    revenue_trend: Optional[float] = None
    orders_trend: Optional[float] = None
    customers_trend: Optional[float] = None
