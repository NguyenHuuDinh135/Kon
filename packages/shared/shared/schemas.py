from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class CustomerBase(BaseModel):
    CustomerID: str
    CompanyName: Optional[str] = None
    ContactName: Optional[str] = None
    ContactTitle: Optional[str] = None
    City: Optional[str] = None
    Country: Optional[str] = None
    Income: Optional[float] = None
    Education: Optional[str] = None

class Customer(CustomerBase):
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    OrderID: int
    CustomerID: Optional[str] = None
    EmployeeID: Optional[int] = None
    OrderDate: Optional[str] = None # Text in DB
    RequiredDate: Optional[str] = None
    ShippedDate: Optional[str] = None
    Freight: Optional[float] = None

class Order(OrderBase):
    class Config:
        from_attributes = True

class CustomerBehaviorBase(BaseModel):
    CustomerID: int
    Gender: Optional[str] = None
    Age: Optional[int] = None
    Annual_Income: Optional[float] = None
    Spending_Score: Optional[float] = None
    Cluster: Optional[int] = None
    Churn_Risk: Optional[float] = None

class CustomerBehavior(CustomerBehaviorBase):
    class Config:
        from_attributes = True

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

class UserBase(BaseModel):
    username: str
    email: str
    role: Optional[str] = "client"
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str

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

class ProductBase(BaseModel):
    ProductName: str
    CategoryID: Optional[int] = None
    QuantityPerUnit: Optional[str] = None
    UnitPrice: Optional[float] = None
    UnitsInStock: Optional[int] = None
    Discontinued: Optional[int] = 0

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    ProductID: int
    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    CategoryName: str
    Description: Optional[str] = None

class Category(CategoryBase):
    CategoryID: int
    class Config:
        from_attributes = True

class OrderDetailBase(BaseModel):
    OrderID: int
    ProductID: int
    UnitPrice: float
    Quantity: int
    Discount: float

class OrderDetail(OrderDetailBase):
    class Config:
        from_attributes = True

class DashboardKPIs(BaseModel):
    total_customers: int
    total_orders: int
    total_revenue: float
    churn_alerts_count: int
    avg_churn_risk: float

class Recommendation(BaseModel):
    CustomerID: str
    RecommendedProducts: List[str]
    Score: float
    CreatedAt: datetime
