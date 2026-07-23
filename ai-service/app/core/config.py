import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PayNest AI Agent Service"
    PORT: int = 8090
    API_V1_STR: str = "/api/ai"
    
    # Internal Service Endpoints
    FINANCE_SERVICE_URL: str = os.getenv("FINANCE_SERVICE_URL", "http://localhost:8082")
    USER_SERVICE_URL: str = os.getenv("USER_SERVICE_URL", "http://localhost:8081")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "b3BlbnNlc3NhbWUtc2VjcmV0LWNoYW5nZS1tZS1pbi1wcm9kdWN0aW9uLXBheW5lc3Q=")
    
    # LLM Settings (OpenAI / Gemini / Anthropic)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
