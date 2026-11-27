from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Application
    APP_NAME: str = "Wimmer API"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # Security
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://wimmer:wimmer@localhost:5432/wimmer"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: list[AnyHttpUrl | str] = ["http://localhost:3000"]

    # File upload
    MAX_UPLOAD_SIZE_MB: int = 50
    UPLOAD_DIR: str = "/tmp/wimmer_uploads"

    # LLM
    LLM_PROVIDER: Literal["nebius", "openai", "mock"] = "mock"
    NEBIUS_API_KEY: str = ""
    NEBIUS_BASE_URL: str = "https://api.studio.nebius.ai/v1"
    NEBIUS_MODEL: str = "meta-llama/Meta-Llama-3.1-70B-Instruct"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # External integrations
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    TAVILY_API_KEY: str = ""

    # Forecasting
    FORECAST_HORIZON_DAYS: int = 90
    MIN_TRAINING_DAYS: int = 30

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: str | list) -> list:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()
