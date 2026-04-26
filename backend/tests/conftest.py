import os
import pytest

@pytest.fixture(autouse=True)
def mock_env():
    os.environ["OPENAI_API_KEY"] = "sk-test-key"
    os.environ["MONGODB_URI"] = "mongodb://localhost:27017"
    os.environ["DATABASE_NAME"] = "test_db"
