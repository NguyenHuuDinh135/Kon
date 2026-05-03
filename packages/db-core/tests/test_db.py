import pytest
import os
from sqlalchemy import create_engine
from db_core.database import DATABASE_URL, init_vector_extension

def test_database_url_exists():
    assert DATABASE_URL is not None
    assert "postgresql" in DATABASE_URL

def test_engine_creation():
    engine = create_engine(DATABASE_URL)
    assert engine is not None

def test_init_vector_extension_syntax(mocker):
    # Mocking engine.connect() to test logic without a real DB connection
    mock_engine = mocker.patch("db_core.database.engine")
    mock_conn = mock_engine.connect.return_value.__enter__.return_value
    
    from db_core.database import init_vector_extension
    init_vector_extension()
    
    # Verify that the correct SQL command was executed
    mock_conn.execute.assert_called()
    args, _ = mock_conn.execute.call_args
    assert "CREATE EXTENSION IF NOT EXISTS vector" in str(args[0])
