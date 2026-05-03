import pytest
import pandas as pd
from main import direct_etl

def test_etl_logic_flow(mocker):
    # Mock kagglehub.load_dataset to return a dummy DataFrame
    mock_load = mocker.patch("kagglehub.load_dataset")
    mock_load.return_value = pd.DataFrame({"id": [1], "name": ["Test"], "Income": [50000], "Education": ["PhD"]})
    
    # Mock engine and to_sql to avoid real DB interaction
    mock_engine = mocker.patch("apps.worker.main.engine")
    mock_to_sql = mocker.patch("pandas.DataFrame.to_sql")
    
    # Mock pd.read_sql for the customer enrichment part
    mock_read_sql = mocker.patch("pandas.read_sql")
    mock_read_sql.return_value = pd.DataFrame({"id": [1], "name": ["Test"]})
    
    # Mock init_vector_extension
    mocker.patch("main.init_vector_extension")
    
    # Execute ETL logic
    direct_etl()
    
    # Verify that load_dataset was called for core tables and satellites
    assert mock_load.call_count >= 3  # Northwind tables + Personality + Behavior
    
    # Verify that to_sql was called to save results
    assert mock_to_sql.call_count >= 3
