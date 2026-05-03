from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, JSON, text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from .database import Base

class Customer(Base):
    __tablename__ = "customers"
    CustomerID = Column(String, primary_key=True, index=True, name="customerID")
    CompanyName = Column(String, name="companyName")
    ContactName = Column(String, name="contactName")
    ContactTitle = Column(String, name="contactTitle")
    City = Column(String, name="city")
    Country = Column(String, name="country")
    Income = Column(Float, name="Income")
    Education = Column(String, name="Education")

class Order(Base):
    __tablename__ = "orders"
    OrderID = Column(Integer, primary_key=True, index=True, name="orderID")
    CustomerID = Column(String, ForeignKey("customers.customerID"), name="customerID")
    EmployeeID = Column(Integer, name="employeeID")
    OrderDate = Column(String, name="orderDate")
    RequiredDate = Column(String, name="requiredDate")
    ShippedDate = Column(String, name="shippedDate")
    Freight = Column(Float, name="freight")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="client") # admin or client
    is_active = Column(Boolean, default=True)
    CreatedAt = Column(DateTime(timezone=True), server_default=func.now())

class Category(Base):
    __tablename__ = "categories"
    CategoryID = Column(Integer, primary_key=True, index=True, name="categoryID")
    CategoryName = Column(String, name="categoryName")
    Description = Column(String, name="description")

class Product(Base):
    __tablename__ = "products"
    ProductID = Column(Integer, primary_key=True, index=True, name="productID")
    ProductName = Column(String, name="productName")
    CategoryID = Column(Integer, ForeignKey("categories.categoryID"), name="categoryID")
    QuantityPerUnit = Column(String, name="quantityPerUnit")
    UnitPrice = Column(Float, name="unitPrice")
    UnitsInStock = Column(Integer, name="unitsInStock")
    Discontinued = Column(Integer, name="discontinued")

class OrderDetail(Base):
    __tablename__ = "order_details"
    OrderID = Column(Integer, ForeignKey("orders.orderID"), primary_key=True, name="orderID")
    ProductID = Column(Integer, ForeignKey("products.productID"), primary_key=True, name="productID")
    UnitPrice = Column(Float, name="unitPrice")
    Quantity = Column(Integer, name="quantity")
    Discount = Column(Float, name="discount")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("users.id"), nullable=True)
    Action = Column(String)
    Table = Column(String)
    RecordID = Column(String)
    Timestamp = Column(DateTime(timezone=True), server_default=func.now())
    Details = Column(JSON, nullable=True)

class CustomerBehavior(Base):
    __tablename__ = "customer_behavior"
    CustomerID = Column(Integer, primary_key=True, name="CustomerID")
    Gender = Column(String, name="Gender")
    Age = Column(Integer, name="Age")
    Annual_Income = Column(Float, name="Annual Income (k$)")
    Spending_Score = Column(Float, name="Spending Score (1-100)")
    embedding = Column(Vector(3072))
    Cluster = Column(Integer, name="Cluster")
    Churn_Risk = Column(Float, name="Churn_Risk")

class MLRecommendation(Base):
    __tablename__ = "ml_recommendations"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    CustomerID = Column(String, index=True)
    RecommendedProducts = Column(JSON)
    Score = Column(Float)
    CreatedAt = Column(DateTime(timezone=True), server_default=func.now())

class SystemAlert(Base):
    __tablename__ = "system_alerts"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Type = Column(String)
    Message = Column(String)
    Severity = Column(String)
    IsRead = Column(Boolean, default=False)
    CreatedAt = Column(DateTime(timezone=True), server_default=func.now())
    RelatedID = Column(String, nullable=True)
