from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "SkillPath AI"
    OPENAI_API_KEY: str
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "skillpath_ai"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
