import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CompetitorIQ"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api"

    # Database
    # Supports postgresql:// or sqlite:///
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./competitoriq.db")

    # Gemini AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    # Scraping & Security bounds
    MAX_PAGES_PER_COMPETITOR: int = 6
    MAX_COMPETITORS_PER_PROJECT: int = 5
    SCRAPE_TIMEOUT_SECONDS: float = 15.0
    MAX_PAGE_SIZE_BYTES: int = 2 * 1024 * 1024  # 2 MB limit per page to prevent memory bloat
    USER_AGENT: str = "CompetitorIQ-ResearchBot/1.0 (+https://competitoriq.local; public-research)"
    
    # Security: In strict mode, prevent private / loopback IP requests (SSRF prevention)
    ALLOW_LOCAL_URLS_FOR_TESTING: bool = False
    ALLOWED_SCHEMES: List[str] = ["http", "https"]

    # Research Agent Bounds
    MAX_WORKFLOW_RETRIES: int = 2
    MAX_LLM_CALLS_PER_JOB: int = 15
    JOB_TIMEOUT_SECONDS: int = 300

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
