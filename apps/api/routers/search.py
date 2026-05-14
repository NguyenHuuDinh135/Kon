import os
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from slowapi import Limiter
from slowapi.util import get_remote_address

from db_core import get_db, engine
from auth import get_current_user
from db_core.models import User

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/search", tags=["search"])

def get_embeddings(text: str):
    """Get embeddings using Gemini or local Ollama."""
    use_ollama = os.getenv("USE_OLLAMA", "false").lower() == "true"
    
    if use_ollama:
        from langchain_ollama import OllamaEmbeddings
        ollama_url = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
        embeddings = OllamaEmbeddings(
            model="nomic-embed-text",
            base_url=ollama_url
        )
        return embeddings.embed_query(text)
    else:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not configured")
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=api_key
        )
        return embeddings.embed_query(text)

@router.get("/behavior")
@limiter.limit("30/minute")
async def search_behavior(
    request: Request,
    query: str,
    limit: int = 12,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Semantic behavior search using pgvector."""
    try:
        query_vector = get_embeddings(query)
        
        # SQL query using <=> for cosine distance
        sql = text("""
            SELECT "CustomerID", "Gender", "Tenure", "CityTier",
                   "PreferedOrderCat", "SatisfactionScore",
                   "OrderCount", "CashbackAmount",
                   embedding <=> :vector as distance
            FROM customer_churn
            WHERE embedding IS NOT NULL
            ORDER BY distance ASC
            LIMIT :lim
        """)
        
        with engine.connect() as conn:
            result = conn.execute(sql, {"vector": str(query_vector), "lim": limit})
            rows = result.fetchall()
            
            # Format results
            columns = result.keys()
            formatted = [dict(zip(columns, row)) for row in rows]
            
            # Handle distance to be JSON serializable
            for item in formatted:
                if "distance" in item:
                    item["distance"] = float(item["distance"])
            
            return {"results": formatted, "total": len(formatted)}
            
    except Exception as e:
        logger.error(f"Search error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Search failed. Please try again later.")
