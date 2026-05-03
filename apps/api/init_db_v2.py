import sys
import os
from sqlalchemy import text

# Setup paths
sys.path.append(os.path.join(os.path.dirname(__file__), "../../packages/db-core"))
from db_core.database import engine, Base, init_vector_extension

def repair_sequences(conn):
    """Ensure all critical tables have auto-increment sequences synced with current data."""
    tables_to_repair = {
        "products": "productID",
        "orders": "orderID",
        "categories": "categoryID"
    }

    for table, pk in tables_to_repair.items():
        seq_name = f"{table}_{pk.lower()}_seq"
        print(f"Repairing sequence for {table}({pk})...")
        
        # 1. Create sequence if not exists
        conn.execute(text(f"CREATE SEQUENCE IF NOT EXISTS {seq_name}"))
        
        # 2. Set default to nextval of sequence
        conn.execute(text(f"ALTER TABLE {table} ALTER COLUMN \"{pk}\" SET DEFAULT nextval('{seq_name}')"))
        
        # 3. Sync sequence with max ID
        conn.execute(text(f"SELECT setval('{seq_name}', COALESCE((SELECT MAX(\"{pk}\") FROM {table}), 1))"))
        
    conn.commit()
    print("✅ Sequences repaired.")

def main():
    print("Enabling vector extension...")
    try:
        init_vector_extension()
        print("✅ Vector extension enabled.")
    except Exception as e:
        print(f"❌ Error enabling vector extension: {e}")

    print("Creating new tables and updating columns...")
    try:
        Base.metadata.create_all(engine)
        print("✅ Database schema updated.")
    except Exception as e:
        print(f"❌ Error updating schema: {e}")

    print("Repairing auto-increment sequences...")
    try:
        with engine.begin() as conn:
            repair_sequences(conn)
    except Exception as e:
        print(f"❌ Error repairing sequences: {e}")

if __name__ == "__main__":
    main()
