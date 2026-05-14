import sys
import os

# Add project root to sys.path
sys.path.append(os.path.join(os.getcwd(), "packages/db-core"))

from db_core.database import engine, Base
from db_core.models import User, AuditLog, SystemAlert, Notification, MLRecommendation, MLModelMetrics, Campaign

def init_db():
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Done.")

if __name__ == "__main__":
    init_db()
