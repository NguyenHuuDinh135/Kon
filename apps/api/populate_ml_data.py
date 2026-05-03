import os
import sys
import time
import pandas as pd
from sqlalchemy import text
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Setup paths
sys.path.append("/app/packages/db-core")
sys.path.append("/app/packages/ai-engine")

from db_core.database import SessionLocal, engine
from db_core.models import CustomerBehavior
from ai_engine.ml_models import run_all_ml_tasks

def populate_embeddings():
    print("Generating embeddings for customer behavior...")
    embeddings_model = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    
    session = SessionLocal()
    try:
        # Fetch records that don't have embeddings
        behaviors = session.query(CustomerBehavior).filter(CustomerBehavior.embedding == None).all()
        print(f"Found {len(behaviors)} records to embed.")
        
        batch_size = 50
        for i in range(0, len(behaviors), batch_size):
            batch = behaviors[i:i+batch_size]
            print(f"Processing batch {i//batch_size + 1} ({len(batch)} records)...")
            
            for b in batch:
                text_repr = f"Customer {b.CustomerID}: {b.Gender}, Age {b.Age}, " \
                            f"Annual Income {b.Annual_Income}k$, " \
                            f"Spending Score {b.Spending_Score}/100"
                
                try:
                    vector = embeddings_model.embed_query(text_repr)
                    b.embedding = vector
                except Exception as e:
                    if "429" in str(e):
                        print("Rate limit hit, sleeping for 60s...")
                        time.sleep(60)
                        vector = embeddings_model.embed_query(text_repr)
                        b.embedding = vector
                    else:
                        raise e
            
            session.commit()
            print(f"Batch {i//batch_size + 1} committed. Sleeping 5s to avoid quota hit...")
            time.sleep(5)
            
        print("✅ Embeddings populated.")
    except Exception as e:
        print(f"❌ Error populating embeddings: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    populate_embeddings()
    run_all_ml_tasks()
