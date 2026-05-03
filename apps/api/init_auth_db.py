import os
import sys
from sqlalchemy.orm import Session

# Add project root to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "../../packages/db-core"))
sys.path.append(os.path.join(os.path.dirname(__file__), "."))

from db_core import engine, Base, get_db
from db_core.models import User
from auth import get_password_hash

def init_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = next(get_db())
    
    # Check if admin exists
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        print("Creating admin user...")
        admin = User(
            username="admin",
            email="admin@kon.ai",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin)
    
    # Check if client exists
    client = db.query(User).filter(User.username == "client").first()
    if not client:
        print("Creating client user...")
        client = User(
            username="client",
            email="client@kon.ai",
            hashed_password=get_password_hash("client123"),
            role="client"
        )
        db.add(client)
    
    db.commit()
    print("Database initialized.")

if __name__ == "__main__":
    init_db()
