import os
import sys
import time
import pandas as pd
import argparse
from sqlalchemy import text

# Setup paths
sys.path.append("/app/packages/db-core")
sys.path.append("/app/packages/ai-engine")

from db_core.database import SessionLocal, engine
from db_core.models import CustomerChurn
from ai_engine.ml_models import run_all_ml_tasks

def populate_embeddings():
    print("Generating embeddings for customer_churn...", flush=True)
    use_ollama = os.getenv("USE_OLLAMA", "").lower() == "true"
    
    if use_ollama:
        from langchain_ollama import OllamaEmbeddings
        base_url = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
        print(f"🚀 Using local Ollama embeddings (nomic-embed-text) at {base_url}...", flush=True)
        embeddings_model = OllamaEmbeddings(
            model="nomic-embed-text",
            base_url=base_url
        )
    else:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        embeddings_model = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
    
    session = SessionLocal()
    try:
        # Fetch records that don't have embeddings
        records = session.query(CustomerChurn).filter(CustomerChurn.embedding == None).all()
        print(f"Found {len(records)} records to embed.", flush=True)
        
        batch_size = 50
        for i in range(0, len(records), batch_size):
            batch = records[i:i+batch_size]
            print(f"Processing batch {i//batch_size + 1} ({len(batch)} records)...", flush=True)
            
            for r in batch:
                text_repr = f"Customer {r.CustomerID}: Gender {r.Gender}, " \
                            f"Tenure {r.Tenure}, Satisfaction Score {r.SatisfactionScore}, " \
                            f"Order Count {r.OrderCount}, Day Since Last Order {r.DaySinceLastOrder}, " \
                            f"Cashback {r.CashbackAmount}"
                
                try:
                    vector = embeddings_model.embed_query(text_repr)
                    r.embedding = vector
                except Exception as e:
                    print(f"  ⚠️ Error embedding record {r.CustomerID}: {e}", flush=True)
                    continue
            
            session.commit()
            if not use_ollama:
                print(f"Batch {i//batch_size + 1} committed. Sleeping 2s to avoid quota hit...", flush=True)
                time.sleep(2)
            else:
                print(f"Batch {i//batch_size + 1} committed.", flush=True)
            
        print("✅ Embeddings populated.", flush=True)
    except Exception as e:
        print(f"❌ Error populating embeddings: {e}", flush=True)
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--embeddings-only", action="store_true")
    parser.add_argument("--ml-only", action="store_true")
    args = parser.parse_args()

    if not args.ml_only:
        populate_embeddings()
    
    if not args.embeddings_only:
        run_all_ml_tasks()
