from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "AI Skill Assessment & Personalized Learning Planner"
    OPENAI_API_KEY: str
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "ai_skill_planner"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
