import os
import sys
import time
import kagglehub
import pandas as pd
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from kagglehub import KaggleDatasetAdapter
from apscheduler.schedulers.blocking import BlockingScheduler

sys.path.append(os.path.join(os.path.dirname(__file__), "../../packages/db-core"))
sys.path.append(os.path.join(os.path.dirname(__file__), "../../packages/shared"))
sys.path.append(os.path.join(os.path.dirname(__file__), "../../packages/ai-engine"))

from db_core import engine, init_vector_extension, Base
from ai_engine.ml_models import run_all_ml_tasks
from ai_engine.autonomous_loop import run_autonomous_cycle


def wait_for_db():
    max_retries = 10
    for i in range(max_retries):
        try:
            init_vector_extension()
            Base.metadata.create_all(bind=engine)
            return True
        except OperationalError:
            if i == max_retries - 1:
                sys.exit(1)
            time.sleep(5)


def table_exists(table_name):
    query = f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '{table_name}')"
    with engine.connect() as conn:
        return conn.execute(text(query)).scalar()


def load_olist_erp():
    """Load Olist Brazilian E-Commerce (Main ERP - 9 tables)."""
    tables_map = {
        "olist_orders_dataset.csv": "orders",
        "olist_order_items_dataset.csv": "order_items",
        "olist_order_payments_dataset.csv": "payments",
        "olist_order_reviews_dataset.csv": "reviews",
        "olist_customers_dataset.csv": "customers",
        "olist_products_dataset.csv": "products",
        "olist_sellers_dataset.csv": "sellers",
        "olist_geolocation_dataset.csv": "geolocation",
        "product_category_name_translation.csv": "category_translation",
    }

    for csv_file, table_name in tables_map.items():
        if not table_exists(table_name):
            try:
                df = kagglehub.load_dataset(
                    KaggleDatasetAdapter.PANDAS,
                    "olistbr/brazilian-ecommerce",
                    csv_file,
                )
                # Limit geolocation to 100K rows (original has 1M+)
                if table_name == "geolocation":
                    df = df.drop_duplicates(subset=["geolocation_zip_code_prefix"]).head(100000)
                df.to_sql(table_name, engine, if_exists='replace', index=False)
                print(f"✅ Loaded {table_name} ({len(df)} rows)")
            except Exception as e:
                print(f"⚠️ Failed to load {table_name}: {e}")


def load_online_retail():
    """Load Online Retail dataset (Satellite 1 - Transaction data for RFM)."""
    if not table_exists("online_retail"):
        try:
            df = kagglehub.load_dataset(
                KaggleDatasetAdapter.PANDAS,
                "tunguz/online-retail",
                "OnlineRetail.csv",
                pandas_kwargs={"encoding": "latin1"}
            )
            # Clean data
            df = df.dropna(subset=["CustomerID"])
            df["CustomerID"] = df["CustomerID"].astype(int)
            df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])
            df["TotalAmount"] = df["Quantity"] * df["UnitPrice"]
            # Remove negative quantities (returns) for clean analysis
            df_clean = df[df["Quantity"] > 0]
            df_clean.to_sql("online_retail", engine, if_exists='replace', index=False)
            print(f"✅ Loaded online_retail ({len(df_clean)} rows)")
        except Exception as e:
            print(f"⚠️ Failed to load online_retail: {e}")


def load_ecommerce_churn():
    """Load E-Commerce Customer Churn dataset (Satellite 2 - Real churn labels)."""
    if not table_exists("customer_churn"):
        try:
            # Try loading the dataset
            path = kagglehub.dataset_download("ankitverma2010/ecommerce-customer-churn-analysis-and-prediction")
            # Find the CSV file in downloaded path
            import glob
            csv_files = glob.glob(f"{path}/**/*.csv", recursive=True)
            if csv_files:
                df = pd.read_csv(csv_files[0])
            else:
                # Try xlsx
                xlsx_files = glob.glob(f"{path}/**/*.xlsx", recursive=True)
                if xlsx_files:
                    df = pd.read_excel(xlsx_files[0])
                else:
                    print("⚠️ No data file found in churn dataset")
                    return

            # Clean column names (remove spaces, special chars)
            df.columns = df.columns.str.strip().str.replace(' ', '_').str.replace('(', '').str.replace(')', '')

            # Fill NaN with median for numeric, mode for categorical
            for col in df.select_dtypes(include=['float64', 'int64']).columns:
                df[col] = df[col].fillna(df[col].median())
            for col in df.select_dtypes(include=['object']).columns:
                df[col] = df[col].fillna(df[col].mode().iloc[0] if not df[col].mode().empty else 'Unknown')

            df.to_sql("customer_churn", engine, if_exists='replace', index=False)
            print(f"✅ Loaded customer_churn ({len(df)} rows)")
        except Exception as e:
            print(f"⚠️ Failed to load customer_churn: {e}")


def generate_churn_embeddings():
    """Generate embeddings for customer churn profiles (for vector search).

    Primary: AWS Bedrock Titan Embed v2 (when USE_BEDROCK=true, default)
    Fallback: Ollama mxbai-embed-large (local)
    """
    use_bedrock = os.getenv("USE_BEDROCK", "true").lower() == "true"
    ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
    ollama_model = os.getenv("OLLAMA_EMBEDDING_MODEL", "mxbai-embed-large")
    bedrock_region = os.getenv("AWS_REGION", "us-west-2")
    bedrock_model_id = os.getenv("BEDROCK_EMBEDDING_MODEL", "amazon.titan-embed-text-v2:0")

    embeddings_model = None

    # Primary: AWS Bedrock Titan Embed v2
    if use_bedrock:
        try:
            from langchain_aws import BedrockEmbeddings
            print(f"🚀 Using AWS Bedrock embeddings ({bedrock_model_id}, region={bedrock_region})...")
            embeddings_model = BedrockEmbeddings(
                model_id=bedrock_model_id,
                region_name=bedrock_region
            )
            # Test with a small embed to verify credentials/connectivity
            embeddings_model.embed_query("test")
            print("✅ Bedrock embeddings connected successfully")
        except ImportError:
            print("⚠️ langchain-aws not available, falling back to Ollama...")
            embeddings_model = None
        except Exception as e:
            print(f"⚠️ Bedrock embeddings failed ({e}), falling back to Ollama...")
            embeddings_model = None

    # Fallback: Ollama mxbai-embed-large
    if embeddings_model is None:
        try:
            from langchain_ollama import OllamaEmbeddings
            print(f"🚀 Using Ollama embeddings ({ollama_model}) at {ollama_base_url}...")
            embeddings_model = OllamaEmbeddings(
                model=ollama_model,
                base_url=ollama_base_url
            )
        except ImportError:
            print("⚠️ langchain-ollama not available, skipping embeddings")
            return
        except Exception as e:
            print(f"⚠️ Ollama embeddings failed ({e}), skipping embeddings")
            return

    # Check if embeddings already exist
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE customer_churn ADD COLUMN IF NOT EXISTS embedding vector(1024)"))
            conn.commit()
        except Exception:
            pass

        count = conn.execute(text(
            "SELECT COUNT(*) FROM customer_churn WHERE embedding IS NOT NULL"
        )).scalar()

        if count > 100:
            print(f"✅ Embeddings already generated ({count} records)")
            return

    print("Generating embeddings for customer_churn (this may take a few minutes)...")

    df = pd.read_sql("SELECT * FROM customer_churn LIMIT 200", engine)  # Limit for API quota

    batch_size = 20
    for i in range(0, len(df), batch_size):
        batch = df.iloc[i:i+batch_size]
        texts = []
        for _, row in batch.iterrows():
            text_repr = (
                f"Customer {int(row.get('CustomerID', 0))}: "
                f"{row.get('Gender', 'Unknown')} gender, "
                f"Tenure {row.get('Tenure', 0)} months, "
                f"Satisfaction {row.get('SatisfactionScore', 0)}/5, "
                f"{row.get('OrderCount', 0)} orders, "
                f"Last order {row.get('DaySinceLastOrder', 0)} days ago, "
                f"Prefers {row.get('PreferedOrderCat', 'unknown')} via {row.get('PreferredPaymentMode', 'unknown')}, "
                f"Cashback ${row.get('CashbackAmount', 0):.0f}, "
                f"{'Complained' if row.get('Complain') == 1 else 'No complaints'}, "
                f"City tier {row.get('CityTier', 0)}"
            )
            texts.append(text_repr)

        try:
            vectors = embeddings_model.embed_documents(texts)
            with engine.connect() as conn:
                for j, vector in enumerate(vectors):
                    cid = int(batch.iloc[j]['CustomerID'])
                    conn.execute(text(
                        "UPDATE customer_churn SET embedding = :vec WHERE \"CustomerID\" = :cid"
                    ), {"vec": str(vector), "cid": cid})
                conn.commit()
            print(f"  Embedded batch {i//batch_size + 1}/{(len(df)-1)//batch_size + 1}")
        except Exception as e:
            print(f"  ⚠️ Batch error: {e}")

        time.sleep(2)  # Rate limiting

    print("✅ Embeddings generation complete")


def create_indexes():
    """Create indexes for performance on large tables."""
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)",
        "CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)",
        "CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id)",
        "CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id)",
        "CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id)",
        'CREATE INDEX IF NOT EXISTS idx_retail_customer ON online_retail("CustomerID")',
        'CREATE INDEX IF NOT EXISTS idx_retail_date ON online_retail("InvoiceDate")',
        'CREATE INDEX IF NOT EXISTS idx_churn_id ON customer_churn("CustomerID")',
    ]
    with engine.connect() as conn:
        for idx_sql in indexes:
            try:
                conn.execute(text(idx_sql))
            except Exception:
                pass
        conn.commit()
    print("✅ Indexes created")


def direct_etl():
    """Full ETL pipeline: Load all 3 datasets into PostgreSQL."""
    wait_for_db()

    print("=" * 60)
    print("STARTING ETL PIPELINE")
    print("=" * 60)

    print("\n[1/5] Loading Olist E-Commerce ERP (9 tables)...")
    load_olist_erp()

    print("\n[2/5] Loading Online Retail transactions (541K rows)...")
    load_online_retail()

    print("\n[3/5] Loading E-Commerce Churn dataset (5,630 rows)...")
    load_ecommerce_churn()

    print("\n[4/5] Creating indexes...")
    create_indexes()

    print("\n[5/5] Generating embeddings (vector search)...")
    generate_churn_embeddings()

    print("\n" + "=" * 60)
    print("ETL COMPLETE")
    print("=" * 60)


def scheduled_ml_tasks():
    print("⏰ Starting scheduled ML tasks...")
    try:
        run_all_ml_tasks()
        # Run autonomous cycle after ML training
        run_autonomous_cycle()
        print("✅ Scheduled tasks completed.")
    except Exception as e:
        print(f"❌ Error: {e}")


def main():
    direct_etl()

    scheduler = BlockingScheduler()
    scheduler.add_job(scheduled_ml_tasks, 'interval', hours=4)
    scheduler.add_job(scheduled_ml_tasks, 'date',
                      run_date=time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time() + 30)))

    print("🚀 Worker started with APScheduler.")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        pass


if __name__ == "__main__":
    main()
