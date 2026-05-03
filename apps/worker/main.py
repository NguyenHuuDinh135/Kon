import os
import sys
import time
import kagglehub
import pandas as pd
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from kagglehub import KaggleDatasetAdapter
from apscheduler.schedulers.blocking import BlockingScheduler

# Add project root to sys.path to find local packages
sys.path.append(os.path.join(os.path.dirname(__file__), "../../packages/db-core"))
sys.path.append(os.path.join(os.path.dirname(__file__), "../../packages/shared"))
sys.path.append(os.path.join(os.path.dirname(__file__), "../../packages/ai-engine"))

from db_core import engine, init_vector_extension
from ai_engine.ml_models import run_all_ml_tasks

def direct_etl():
    """Initial data load."""
    # --- 0. Wait for DB ---
    max_retries = 5
    retry_delay = 5
    for i in range(max_retries):
        try:
            init_vector_extension()
            break
        except OperationalError:
            if i == max_retries - 1:
                sys.exit(1)
            time.sleep(retry_delay)

    # --- 1. Load Northwind ---
    northwind_tables = ["customers", "orders", "order_details", "products", "categories"]
    for table in northwind_tables:
        # Check if table exists
        check_query = f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '{table}')"
        with engine.connect() as conn:
            exists = conn.execute(text(check_query)).scalar()
        
        if not exists:
            df = kagglehub.load_dataset(
                KaggleDatasetAdapter.PANDAS,
                "jeetahirwar/northwind-traders",
                f"{table}.csv",
                pandas_kwargs={"encoding": "latin1"}
            )
            df.to_sql(table, engine, if_exists='replace', index=False)
            print(f"✅ Loaded {table}")

    # --- 2. Customer Behavior (If not exists) ---
    check_query = "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customer_behavior')"
    with engine.connect() as conn:
        exists = conn.execute(text(check_query)).scalar()
    
    if not exists:
        df_behavior = kagglehub.load_dataset(
            KaggleDatasetAdapter.PANDAS,
            "vjchoudhary7/customer-segmentation-tutorial-in-python",
            "Mall_Customers.csv",
            pandas_kwargs={"encoding": "latin1"}
        )
        df_behavior.to_sql("customer_behavior", engine, if_exists='replace', index=False)
        
        # Add ML columns immediately after loading
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE customer_behavior ADD COLUMN IF NOT EXISTS embedding vector(3072);"))
            conn.execute(text("ALTER TABLE customer_behavior ADD COLUMN IF NOT EXISTS \"Cluster\" integer;"))
            conn.execute(text("ALTER TABLE customer_behavior ADD COLUMN IF NOT EXISTS \"Churn_Risk\" float;"))
            conn.commit()
        print("✅ Loaded customer_behavior and added ML columns")

def scheduled_ml_tasks():
    print("⏰ Starting scheduled ML tasks...")
    try:
        # Run ML logic
        run_all_ml_tasks()
        print("✅ Scheduled ML tasks completed.")
    except Exception as e:
        print(f"❌ Error in scheduled ML tasks: {e}")

def main():
    # 1. Run initial ETL
    direct_etl()
    
    # 2. Setup Scheduler
    scheduler = BlockingScheduler()
    # Run every 4 hours
    scheduler.add_job(scheduled_ml_tasks, 'interval', hours=4)
    # Also run once at start
    scheduler.add_job(scheduled_ml_tasks, 'date', run_date=time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time() + 10)))
    
    print("🚀 Worker started with APScheduler.")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        pass

if __name__ == "__main__":
    main()
