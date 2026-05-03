import sys
import os

# Setup paths
sys.path.append("/app/packages/db-core")
from db_core.database import engine, Base, init_vector_extension
from db_core.models import Customer, Order, CustomerBehavior, MLRecommendation, SystemAlert

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

if __name__ == "__main__":
    main()
