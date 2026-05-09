"""
Exploratory Data Analysis for Kon Project - New Datasets
==========================================================
Datasets:
  1. E-Commerce Churn (customer_churn): 5,630 rows, 20 features + Churn label
  2. Online Retail (online_retail): 541K transaction rows, 4,300+ unique customers
  3. Olist Orders (orders): 100K rows
  4. Olist Order Items (order_items): 113K rows

Purpose: Document analytical decisions with statistical justification
before feeding data into ML models. Produces reproducible evidence for
feature selection, cluster count, and model design choices.
"""
import pandas as pd
import numpy as np
from scipy import stats
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

# ---------------------------------------------------------------------------
# 1. DATA LOADING
# ---------------------------------------------------------------------------
try:
    from sqlalchemy import create_engine
    import os
    DATABASE_URL = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/kon",
    )
    _engine = create_engine(DATABASE_URL)

    # Load all datasets
    churn_df = pd.read_sql('SELECT * FROM customer_churn', _engine)
    retail_df = pd.read_sql(
        'SELECT * FROM online_retail WHERE "CustomerID" IS NOT NULL',
        _engine,
    )
    orders_df = pd.read_sql('SELECT * FROM orders', _engine)
    order_items_df = pd.read_sql('SELECT * FROM order_items', _engine)

except Exception as e:
    print(f"Database connection failed: {e}")
    print("Please ensure PostgreSQL is running and datasets are loaded.")
    raise SystemExit(1)

print(f"Loaded datasets:")
print(f"  customer_churn:  {len(churn_df):,} rows, {churn_df.shape[1]} columns")
print(f"  online_retail:   {len(retail_df):,} rows, {retail_df.shape[1]} columns")
print(f"  orders:          {len(orders_df):,} rows, {orders_df.shape[1]} columns")
print(f"  order_items:     {len(order_items_df):,} rows, {order_items_df.shape[1]} columns")

# ---------------------------------------------------------------------------
# 2. E-COMMERCE CHURN DATASET ANALYSIS
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("E-COMMERCE CHURN DATASET (5,630 rows)")
print("=" * 70)

print("\n--- Descriptive Statistics ---")
print(churn_df.describe())
print(f"\nMissing values:\n{churn_df.isnull().sum()}")
print(f"\nData types:\n{churn_df.dtypes}")

# Churn label distribution (class balance)
print("\n--- Churn Label Distribution ---")
churn_counts = churn_df['Churn'].value_counts()
churn_pct = churn_df['Churn'].value_counts(normalize=True)
print(f"  Not Churned (0): {churn_counts.get(0, 0):,} ({churn_pct.get(0, 0)*100:.1f}%)")
print(f"  Churned (1):     {churn_counts.get(1, 0):,} ({churn_pct.get(1, 0)*100:.1f}%)")
imbalance_ratio = churn_counts.min() / churn_counts.max()
print(f"  Imbalance ratio: {imbalance_ratio:.3f}")
if imbalance_ratio < 0.3:
    print("  WARNING: Significant class imbalance detected. Consider SMOTE or class weights.")
else:
    print("  Class balance is acceptable for standard training.")

# Numeric feature distributions
print("\n--- Numeric Feature Distributions ---")
numeric_churn_cols = [
    'Tenure', 'CityTier', 'WarehouseToHome', 'HourSpendOnApp',
    'NumberOfDeviceRegistered', 'SatisfactionScore', 'NumberOfAddress',
    'Complain', 'OrderAmountHikeFromlastYear', 'CouponUsed',
    'OrderCount', 'DaySinceLastOrder', 'CashbackAmount',
]

for col in numeric_churn_cols:
    if col not in churn_df.columns:
        continue
    series = pd.to_numeric(churn_df[col], errors='coerce').dropna()
    if series.empty:
        continue
    skew = series.skew()
    print(f"\n  {col}:")
    print(f"    Range: [{series.min():.1f}, {series.max():.1f}]")
    print(f"    Mean: {series.mean():.2f}, Median: {series.median():.2f}, Std: {series.std():.2f}")
    print(f"    Skewness: {skew:.3f} ({'right-skewed' if skew > 0.5 else 'left-skewed' if skew < -0.5 else 'symmetric'})")
    print(f"    Missing: {churn_df[col].isnull().sum()}")

# Categorical features
print("\n--- Categorical Feature Distributions ---")
categorical_churn_cols = [
    'PreferredLoginDevice', 'PreferredPaymentMode',
    'Gender', 'MaritalStatus', 'PreferedOrderCat',
]
for col in categorical_churn_cols:
    if col not in churn_df.columns:
        continue
    print(f"\n  {col}:")
    vc = churn_df[col].value_counts()
    for val, count in vc.items():
        print(f"    {val}: {count} ({count/len(churn_df)*100:.1f}%)")

# ---------------------------------------------------------------------------
# 3. CORRELATION MATRIX (20 Churn Features)
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("CORRELATION MATRIX - CHURN FEATURES")
print("=" * 70)

# Encode categoricals for correlation
churn_encoded = churn_df.copy()
for col in categorical_churn_cols:
    if col in churn_encoded.columns:
        churn_encoded[col] = churn_encoded[col].astype('category').cat.codes

all_numeric_cols = numeric_churn_cols + categorical_churn_cols + ['Churn']
available_cols = [c for c in all_numeric_cols if c in churn_encoded.columns]
for col in available_cols:
    churn_encoded[col] = pd.to_numeric(churn_encoded[col], errors='coerce')

corr_matrix = churn_encoded[available_cols].corr()
print("\nFull correlation matrix:")
print(corr_matrix.round(3).to_string())

# Correlations with Churn target
print("\n--- Correlations with Churn (sorted by absolute value) ---")
if 'Churn' in corr_matrix.columns:
    churn_corr = corr_matrix['Churn'].drop('Churn').abs().sort_values(ascending=False)
    for feature, corr_val in churn_corr.items():
        direction = corr_matrix.loc[feature, 'Churn']
        sign = "+" if direction > 0 else "-"
        print(f"  {sign} {feature}: r = {direction:.4f} (|r| = {corr_val:.4f})")

# ---------------------------------------------------------------------------
# 4. ONLINE RETAIL - RFM ANALYSIS
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("ONLINE RETAIL DATASET - RFM ANALYSIS (541K transactions)")
print("=" * 70)

print(f"\nBasic statistics:")
print(f"  Total transactions: {len(retail_df):,}")
print(f"  Unique customers: {retail_df['CustomerID'].nunique():,}")
print(f"  Unique products (StockCode): {retail_df['StockCode'].nunique():,}")
print(f"  Countries: {retail_df['Country'].nunique()}")
print(f"  Date range: {retail_df['InvoiceDate'].min()} to {retail_df['InvoiceDate'].max()}")

# Compute RFM
retail_df['InvoiceDate'] = pd.to_datetime(retail_df['InvoiceDate'])
retail_df['TotalAmount'] = pd.to_numeric(retail_df['TotalAmount'], errors='coerce')

max_date = retail_df['InvoiceDate'].max()
rfm = retail_df.groupby('CustomerID').agg(
    last_purchase=('InvoiceDate', 'max'),
    frequency=('InvoiceNo', 'nunique'),
    monetary=('TotalAmount', 'sum'),
).reset_index()
rfm['recency'] = (max_date - rfm['last_purchase']).dt.days

print("\n--- RFM Distribution ---")
for col in ['recency', 'frequency', 'monetary']:
    series = rfm[col].dropna()
    print(f"\n  {col}:")
    print(f"    Range: [{series.min():.1f}, {series.max():.1f}]")
    print(f"    Mean: {series.mean():.2f}, Median: {series.median():.2f}")
    print(f"    Std: {series.std():.2f}")
    print(f"    Skewness: {series.skew():.3f}")
    # Percentiles
    for p in [25, 50, 75, 90, 95]:
        print(f"    P{p}: {series.quantile(p/100):.1f}")

# Country distribution
print("\n--- Top 10 Countries by Transaction Count ---")
country_counts = retail_df['Country'].value_counts().head(10)
for country, count in country_counts.items():
    print(f"  {country}: {count:,} ({count/len(retail_df)*100:.1f}%)")

# ---------------------------------------------------------------------------
# 5. CLUSTER NUMBER JUSTIFICATION (Elbow + Silhouette on RFM)
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("CLUSTER NUMBER JUSTIFICATION (RFM)")
print("=" * 70)

X_cluster = rfm[['recency', 'frequency', 'monetary']].dropna()
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_cluster)

K_range = range(2, 9)
inertias = []
silhouettes = []

for k in K_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X_scaled)
    inertias.append(km.inertia_)
    silhouettes.append(silhouette_score(X_scaled, labels))

print("\n  k | Inertia      | Silhouette | Delta Inertia")
print("  " + "-" * 55)
for i, k in enumerate(K_range):
    delta = "" if i == 0 else f"{inertias[i-1] - inertias[i]:.1f}"
    print(f"  {k} | {inertias[i]:12.1f} | {silhouettes[i]:.4f}     | {delta}")

best_k = list(K_range)[np.argmax(silhouettes)]
print(f"\n  Best k by silhouette: {best_k} (score={max(silhouettes):.4f})")
print(f"  Using k=5 for business interpretability: VIP, Loyal, At Risk, Casual, New")

# ---------------------------------------------------------------------------
# 6. OLIST DATASET ANALYSIS
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("OLIST ORDERS DATASET (100K orders)")
print("=" * 70)

print(f"\nOrders overview:")
print(f"  Total orders: {len(orders_df):,}")
print(f"  Unique customers: {orders_df['customer_id'].nunique():,}")
if 'order_status' in orders_df.columns:
    print(f"\n  Order status distribution:")
    for status, count in orders_df['order_status'].value_counts().items():
        print(f"    {status}: {count:,} ({count/len(orders_df)*100:.1f}%)")

print(f"\nOrder items overview:")
print(f"  Total items: {len(order_items_df):,}")
print(f"  Unique products: {order_items_df['product_id'].nunique():,}")
print(f"  Unique sellers: {order_items_df['seller_id'].nunique():,}")

# Price and freight analysis
order_items_df['price'] = pd.to_numeric(order_items_df['price'], errors='coerce')
order_items_df['freight_value'] = pd.to_numeric(order_items_df['freight_value'], errors='coerce')

print(f"\n  Price statistics:")
print(f"    Mean: ${order_items_df['price'].mean():.2f}")
print(f"    Median: ${order_items_df['price'].median():.2f}")
print(f"    Max: ${order_items_df['price'].max():.2f}")

print(f"\n  Freight value statistics:")
print(f"    Mean: ${order_items_df['freight_value'].mean():.2f}")
print(f"    Median: ${order_items_df['freight_value'].median():.2f}")
print(f"    Max: ${order_items_df['freight_value'].max():.2f}")

# Monthly revenue trend (for forecast model)
orders_df['order_purchase_timestamp'] = pd.to_datetime(
    orders_df['order_purchase_timestamp'], errors='coerce'
)
merged = orders_df.merge(order_items_df, on='order_id', how='inner')
merged['revenue'] = merged['price'] + merged['freight_value']
monthly_rev = (
    merged[merged['order_status'] == 'delivered']
    .set_index('order_purchase_timestamp')
    .resample('M')['revenue']
    .sum()
)

print(f"\n--- Monthly Revenue Trend (Delivered Orders) ---")
print(f"  Months with data: {len(monthly_rev)}")
if not monthly_rev.empty:
    print(f"  Date range: {monthly_rev.index.min().strftime('%Y-%m')} to {monthly_rev.index.max().strftime('%Y-%m')}")
    print(f"  Average monthly revenue: ${monthly_rev.mean():,.2f}")
    print(f"  Min monthly revenue: ${monthly_rev.min():,.2f}")
    print(f"  Max monthly revenue: ${monthly_rev.max():,.2f}")
    print(f"  Revenue growth (first vs last): {((monthly_rev.iloc[-1] / monthly_rev.iloc[0]) - 1)*100:.1f}%")

# ---------------------------------------------------------------------------
# 7. FEATURE SELECTION JUSTIFICATION FOR ML MODELS
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("FEATURE SELECTION JUSTIFICATION")
print("=" * 70)

print("""
  Model 1 - K-Means Clustering:
    Features: recency, frequency, monetary (RFM from online_retail)
    Rationale: RFM is the gold standard for customer segmentation.
    These three dimensions capture when a customer last purchased,
    how often they buy, and how much they spend.

  Model 2 - Decision Tree (Engagement Classification):
    Features: Tenure, SatisfactionScore, NumberOfDeviceRegistered,
              WarehouseToHome, NumberOfAddress, CashbackAmount
    Target: engagement_level (derived from OrderCount + CouponUsed + HourSpendOnApp)
    Rationale: Excludes churn-correlated features to avoid target leakage.
    Uses demographic and service features to predict engagement tier.

  Model 3 - Logistic Regression (Churn Prediction):
    Features: All 13 numeric + 5 categorical (one-hot encoded)
    Target: Churn column (REAL labels, 0/1)
    Rationale: Uses the actual churn labels from the dataset.
    One-hot encoding for categoricals preserves ordinal-free relationships.

  Model 4 - Revenue Forecast:
    Features: month_number (time index)
    Target: monthly revenue from Olist delivered orders
    Rationale: Simple linear trend captures growth trajectory for 3-month forecast.
""")

# ---------------------------------------------------------------------------
# 8. OUTLIER DETECTION (IQR Method)
# ---------------------------------------------------------------------------
print("=" * 70)
print("OUTLIER DETECTION")
print("=" * 70)

print("\n--- RFM Outliers ---")
for col in ['recency', 'frequency', 'monetary']:
    series = rfm[col].dropna()
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    outliers = series[(series < lower_bound) | (series > upper_bound)]
    print(f"\n  {col}:")
    print(f"    Q1={Q1:.1f}, Q3={Q3:.1f}, IQR={IQR:.1f}")
    print(f"    Bounds: [{lower_bound:.1f}, {upper_bound:.1f}]")
    print(f"    Outliers: {len(outliers)} ({len(outliers)/len(series)*100:.1f}%)")

print("\n--- Churn Feature Outliers ---")
for col in ['CashbackAmount', 'WarehouseToHome', 'OrderCount', 'DaySinceLastOrder']:
    if col not in churn_df.columns:
        continue
    series = pd.to_numeric(churn_df[col], errors='coerce').dropna()
    if series.empty:
        continue
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    outliers = series[(series < lower_bound) | (series > upper_bound)]
    print(f"\n  {col}:")
    print(f"    Q1={Q1:.1f}, Q3={Q3:.1f}, IQR={IQR:.1f}")
    print(f"    Bounds: [{lower_bound:.1f}, {upper_bound:.1f}]")
    print(f"    Outliers: {len(outliers)} ({len(outliers)/len(series)*100:.1f}%)")

# ---------------------------------------------------------------------------
# 9. SUMMARY & CONCLUSIONS
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("SUMMARY & CONCLUSIONS")
print("=" * 70)
print(f"""
  Datasets loaded:
    - customer_churn: {len(churn_df):,} rows (churn rate: {churn_pct.get(1, 0)*100:.1f}%)
    - online_retail: {len(retail_df):,} transactions, {rfm.shape[0]:,} unique customers
    - orders: {len(orders_df):,} orders
    - order_items: {len(order_items_df):,} items

  Key Findings:
    1. Churn class balance: {churn_pct.get(0, 0)*100:.0f}/{churn_pct.get(1, 0)*100:.0f} split
       {'Acceptable for training' if imbalance_ratio >= 0.3 else 'Imbalanced - use stratification'}
    2. RFM segmentation on {rfm.shape[0]:,} customers (best k={best_k} by silhouette)
    3. Online retail is heavily UK-focused (check country distribution above)
    4. Olist has {len(monthly_rev)} months of revenue data for forecasting

  ML Model Design Decisions:
    1. KMeans: 5 clusters on RFM (VIP, Loyal, At Risk, Casual, New)
    2. Decision Tree: Engagement classification to avoid churn leakage
    3. Logistic Regression: Real churn labels with full feature set
    4. Revenue Forecast: Linear trend on monthly Olist revenue

  Data Quality Notes:
    - Missing values in churn dataset: {churn_df.isnull().sum().sum()} total
    - Online retail filtered to non-null CustomerID
    - StandardScaler required for KMeans and Logistic Regression
""")
