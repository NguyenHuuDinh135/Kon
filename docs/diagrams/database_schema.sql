-- ============================================================
-- KON ERP DATABASE SCHEMA
-- SQL Server (T-SQL) — Compatible with SSMS
-- Chạy script này trong SSMS để tạo ERD diagram
-- ============================================================

-- Tạo database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'kon_erp_northwind')
    CREATE DATABASE kon_erp_northwind;
GO

USE kon_erp_northwind;
GO

-- ============================================================
-- LAYER 1: OLIST E-COMMERCE (ERP Core) — 9 tables
-- ============================================================

IF OBJECT_ID('dbo.olist_customers', 'U') IS NULL
CREATE TABLE dbo.olist_customers (
    customer_id             NVARCHAR(50) NOT NULL PRIMARY KEY,
    customer_unique_id      NVARCHAR(50) NOT NULL,
    customer_zip_code       NVARCHAR(10) NULL,
    customer_city           NVARCHAR(100) NULL,
    customer_state          NVARCHAR(5) NULL
);
GO

IF OBJECT_ID('dbo.olist_sellers', 'U') IS NULL
CREATE TABLE dbo.olist_sellers (
    seller_id               NVARCHAR(50) NOT NULL PRIMARY KEY,
    seller_zip_code         NVARCHAR(10) NULL,
    seller_city             NVARCHAR(100) NULL,
    seller_state            NVARCHAR(5) NULL
);
GO

IF OBJECT_ID('dbo.olist_products', 'U') IS NULL
CREATE TABLE dbo.olist_products (
    product_id              NVARCHAR(50) NOT NULL PRIMARY KEY,
    product_category_name   NVARCHAR(100) NULL,
    product_name_length     INT NULL,
    product_description_length INT NULL,
    product_photos_qty      INT NULL,
    product_weight_g        FLOAT NULL,
    product_length_cm       FLOAT NULL,
    product_height_cm       FLOAT NULL,
    product_width_cm        FLOAT NULL
);
GO

IF OBJECT_ID('dbo.olist_orders', 'U') IS NULL
CREATE TABLE dbo.olist_orders (
    order_id                    NVARCHAR(50) NOT NULL PRIMARY KEY,
    customer_id                 NVARCHAR(50) NOT NULL,
    order_status                NVARCHAR(20) NULL,
    order_purchase_timestamp    DATETIME2 NULL,
    order_approved_at           DATETIME2 NULL,
    order_delivered_carrier_date DATETIME2 NULL,
    order_delivered_customer_date DATETIME2 NULL,
    order_estimated_delivery_date DATETIME2 NULL,
    CONSTRAINT FK_orders_customer FOREIGN KEY (customer_id)
        REFERENCES dbo.olist_customers(customer_id)
);
GO

IF OBJECT_ID('dbo.olist_order_items', 'U') IS NULL
CREATE TABLE dbo.olist_order_items (
    order_id                NVARCHAR(50) NOT NULL,
    order_item_id           INT NOT NULL,
    product_id              NVARCHAR(50) NOT NULL,
    seller_id               NVARCHAR(50) NOT NULL,
    shipping_limit_date     DATETIME2 NULL,
    price                   DECIMAL(10,2) NULL,
    freight_value           DECIMAL(10,2) NULL,
    CONSTRAINT PK_order_items PRIMARY KEY (order_id, order_item_id),
    CONSTRAINT FK_items_order FOREIGN KEY (order_id)
        REFERENCES dbo.olist_orders(order_id),
    CONSTRAINT FK_items_product FOREIGN KEY (product_id)
        REFERENCES dbo.olist_products(product_id),
    CONSTRAINT FK_items_seller FOREIGN KEY (seller_id)
        REFERENCES dbo.olist_sellers(seller_id)
);
GO

IF OBJECT_ID('dbo.olist_order_payments', 'U') IS NULL
CREATE TABLE dbo.olist_order_payments (
    order_id                NVARCHAR(50) NOT NULL,
    payment_sequential      INT NOT NULL,
    payment_type            NVARCHAR(30) NULL,
    payment_installments    INT NULL,
    payment_value           DECIMAL(10,2) NULL,
    CONSTRAINT PK_payments PRIMARY KEY (order_id, payment_sequential),
    CONSTRAINT FK_payments_order FOREIGN KEY (order_id)
        REFERENCES dbo.olist_orders(order_id)
);
GO

IF OBJECT_ID('dbo.olist_order_reviews', 'U') IS NULL
CREATE TABLE dbo.olist_order_reviews (
    review_id               NVARCHAR(50) NOT NULL PRIMARY KEY,
    order_id                NVARCHAR(50) NOT NULL,
    review_score            INT NULL CHECK (review_score BETWEEN 1 AND 5),
    review_comment_title    NVARCHAR(MAX) NULL,
    review_comment_message  NVARCHAR(MAX) NULL,
    review_creation_date    DATETIME2 NULL,
    review_answer_timestamp DATETIME2 NULL,
    CONSTRAINT FK_reviews_order FOREIGN KEY (order_id)
        REFERENCES dbo.olist_orders(order_id)
);
GO

IF OBJECT_ID('dbo.olist_geolocation', 'U') IS NULL
CREATE TABLE dbo.olist_geolocation (
    geolocation_zip_code    NVARCHAR(10) NULL,
    geolocation_lat         FLOAT NULL,
    geolocation_lng         FLOAT NULL,
    geolocation_city        NVARCHAR(100) NULL,
    geolocation_state       NVARCHAR(5) NULL
);
GO

IF OBJECT_ID('dbo.product_category_translation', 'U') IS NULL
CREATE TABLE dbo.product_category_translation (
    product_category_name           NVARCHAR(100) NOT NULL PRIMARY KEY,
    product_category_name_english   NVARCHAR(100) NULL
);
GO

-- ============================================================
-- LAYER 2: ONLINE RETAIL — RFM Analysis
-- ============================================================

IF OBJECT_ID('dbo.online_retail_transactions', 'U') IS NULL
CREATE TABLE dbo.online_retail_transactions (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    invoice_no              NVARCHAR(20) NULL,
    stock_code              NVARCHAR(20) NULL,
    description             NVARCHAR(MAX) NULL,
    quantity                INT NULL,
    invoice_date            DATETIME2 NULL,
    unit_price              DECIMAL(10,2) NULL,
    customer_id             INT NULL,
    country                 NVARCHAR(50) NULL
);
GO

-- ============================================================
-- LAYER 3: CUSTOMER CHURN — Supervised ML
-- ============================================================

IF OBJECT_ID('dbo.customer_churn', 'U') IS NULL
CREATE TABLE dbo.customer_churn (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    customer_id             NVARCHAR(50) NULL,
    tenure                  INT NULL,
    preferred_login_device  NVARCHAR(50) NULL,
    city_tier               INT NULL,
    warehouse_to_home       FLOAT NULL,
    preferred_payment_mode  NVARCHAR(50) NULL,
    gender                  NVARCHAR(10) NULL,
    hour_spend_on_app       FLOAT NULL,
    number_of_device_registered INT NULL,
    preferred_order_cat     NVARCHAR(50) NULL,
    satisfaction_score      INT NULL,
    marital_status          NVARCHAR(20) NULL,
    number_of_address       INT NULL,
    complain                INT NULL,
    order_amount_hike       FLOAT NULL,
    coupon_used             INT NULL,
    order_count             INT NULL,
    day_since_last_order    INT NULL,
    cashback_amount         FLOAT NULL,
    churn                   INT NULL CHECK (churn IN (0, 1)),
    -- Vector embedding stored as JSON string (1024-dim)
    -- In production: PostgreSQL pgvector Vector(1024)
    embedding               NVARCHAR(MAX) NULL
);
GO

-- ============================================================
-- SYSTEM TABLES
-- ============================================================

IF OBJECT_ID('dbo.users', 'U') IS NULL
CREATE TABLE dbo.users (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    username                NVARCHAR(50) NOT NULL UNIQUE,
    email                   NVARCHAR(100) NOT NULL UNIQUE,
    hashed_password         NVARCHAR(255) NOT NULL,
    full_name               NVARCHAR(100) NULL,
    [role]                  NVARCHAR(20) DEFAULT 'user',
    is_active               BIT DEFAULT 1,
    created_at              DATETIME2 DEFAULT GETDATE(),
    updated_at              DATETIME2 DEFAULT GETDATE()
);
GO

IF OBJECT_ID('dbo.audit_logs', 'U') IS NULL
CREATE TABLE dbo.audit_logs (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    user_id                 INT NULL,
    [action]                NVARCHAR(50) NOT NULL,
    resource_type           NVARCHAR(50) NULL,
    resource_id             NVARCHAR(100) NULL,
    details                 NVARCHAR(MAX) NULL,  -- JSON
    ip_address              NVARCHAR(45) NULL,
    created_at              DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_audit_user FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
);
GO

IF OBJECT_ID('dbo.notifications', 'U') IS NULL
CREATE TABLE dbo.notifications (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    user_id                 INT NULL,
    title                   NVARCHAR(200) NOT NULL,
    [message]               NVARCHAR(MAX) NULL,
    [type]                  NVARCHAR(30) DEFAULT 'info',
    is_read                 BIT DEFAULT 0,
    [source]                NVARCHAR(50) NULL,
    created_at              DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_notif_user FOREIGN KEY (user_id)
        REFERENCES dbo.users(id)
);
GO

IF OBJECT_ID('dbo.campaigns', 'U') IS NULL
CREATE TABLE dbo.campaigns (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    [name]                  NVARCHAR(200) NOT NULL,
    [description]           NVARCHAR(MAX) NULL,
    target_segment          NVARCHAR(50) NULL,
    [status]                NVARCHAR(20) DEFAULT 'draft',
    channel                 NVARCHAR(30) NULL,
    budget                  DECIMAL(12,2) NULL,
    start_date              DATE NULL,
    end_date                DATE NULL,
    created_by              INT NULL,
    approved_by             INT NULL,
    created_at              DATETIME2 DEFAULT GETDATE(),
    updated_at              DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_camp_created FOREIGN KEY (created_by)
        REFERENCES dbo.users(id),
    CONSTRAINT FK_camp_approved FOREIGN KEY (approved_by)
        REFERENCES dbo.users(id)
);
GO

IF OBJECT_ID('dbo.system_alerts', 'U') IS NULL
CREATE TABLE dbo.system_alerts (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    alert_type              NVARCHAR(50) NOT NULL,
    severity                NVARCHAR(20) DEFAULT 'info',
    [message]               NVARCHAR(MAX) NOT NULL,
    is_resolved             BIT DEFAULT 0,
    resolved_at             DATETIME2 NULL,
    created_at              DATETIME2 DEFAULT GETDATE()
);
GO

-- ============================================================
-- ML TABLES
-- ============================================================

IF OBJECT_ID('dbo.ml_model_metrics', 'U') IS NULL
CREATE TABLE dbo.ml_model_metrics (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    model_name              NVARCHAR(100) NOT NULL,
    model_version           NVARCHAR(20) NULL,
    algorithm               NVARCHAR(50) NULL,
    accuracy                FLOAT NULL,
    precision_score         FLOAT NULL,
    recall_score            FLOAT NULL,
    f1_score                FLOAT NULL,
    roc_auc                 FLOAT NULL,
    training_samples        INT NULL,
    feature_importance      NVARCHAR(MAX) NULL,  -- JSON
    hyperparameters         NVARCHAR(MAX) NULL,  -- JSON
    trained_at              DATETIME2 DEFAULT GETDATE()
);
GO

IF OBJECT_ID('dbo.ml_recommendations', 'U') IS NULL
CREATE TABLE dbo.ml_recommendations (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    customer_id             NVARCHAR(50) NULL,
    recommendation_type     NVARCHAR(50) NULL,
    recommended_items       NVARCHAR(MAX) NULL,  -- JSON
    confidence_score        FLOAT NULL,
    segment                 NVARCHAR(30) NULL,
    created_at              DATETIME2 DEFAULT GETDATE()
);
GO

-- ============================================================
-- INDEXES
-- ============================================================

CREATE NONCLUSTERED INDEX IX_orders_customer
    ON dbo.olist_orders(customer_id);
GO

CREATE NONCLUSTERED INDEX IX_orders_status
    ON dbo.olist_orders(order_status);
GO

CREATE NONCLUSTERED INDEX IX_order_items_product
    ON dbo.olist_order_items(product_id);
GO

CREATE NONCLUSTERED INDEX IX_order_items_seller
    ON dbo.olist_order_items(seller_id);
GO

CREATE NONCLUSTERED INDEX IX_retail_customer
    ON dbo.online_retail_transactions(customer_id);
GO

CREATE NONCLUSTERED INDEX IX_retail_date
    ON dbo.online_retail_transactions(invoice_date);
GO

CREATE NONCLUSTERED INDEX IX_churn_label
    ON dbo.customer_churn(churn);
GO

CREATE NONCLUSTERED INDEX IX_notifications_user
    ON dbo.notifications(user_id, is_read);
GO

CREATE NONCLUSTERED INDEX IX_campaigns_status
    ON dbo.campaigns([status]);
GO

CREATE NONCLUSTERED INDEX IX_ml_metrics_model
    ON dbo.ml_model_metrics(model_name, trained_at DESC);
GO

-- ============================================================
-- TABLE DESCRIPTIONS (Extended Properties for SSMS ERD)
-- ============================================================

EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Khách hàng Olist E-Commerce (Brazil)',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'olist_customers';
GO

EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Đơn hàng — liên kết customers, items, payments',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'olist_orders';
GO

EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Chi tiết đơn hàng — products, sellers, giá',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'olist_order_items';
GO

EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Thanh toán đơn hàng — multi payment types',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'olist_order_payments';
GO

EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Đánh giá đơn hàng — score 1-5, comments',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'olist_order_reviews';
GO

EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Giao dịch Online Retail — dùng cho RFM analysis',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'online_retail_transactions';
GO

EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Dữ liệu churn có nhãn — ML training + vector search (1024-dim)',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'customer_churn';
GO

EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Lịch sử train ML models — accuracy, F1, SHAP, version tracking',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'ml_model_metrics';
GO

EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Chiến dịch marketing — AI đề xuất, human-in-the-loop approve',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'campaigns';
GO

EXEC sp_addextendedproperty
    @name = N'MS_Description',
    @value = N'Người dùng hệ thống — JWT auth, role-based access',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'users';
GO

-- ============================================================
-- DONE!
-- Mở SSMS → Database Diagrams → New Diagram → Add all tables
-- SSMS sẽ tự vẽ ERD với relationships từ Foreign Keys
-- ============================================================

PRINT N'✓ Schema created successfully!';
PRINT N'✓ 20 tables across 3 data layers + system + ML';
PRINT N'✓ Foreign keys defined for ERD generation';
PRINT N'';
PRINT N'Next: Right-click Database Diagrams → New Database Diagram';
PRINT N'      Select all tables → Add → Arrange Tables';
GO
