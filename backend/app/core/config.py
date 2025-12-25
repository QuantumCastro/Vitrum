from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Backend API"
    environment: str = "development"
    api_prefix: str = Field(default="/api", validation_alias="API_PREFIX")
    database_url: str = Field(
        default="postgresql+asyncpg://app:app@db:5432/app", validation_alias="DATABASE_URL"
    )
    backend_cors_origins: str = Field(
        default="http://localhost:8080,http://localhost:4321,http://localhost:3000,http://127.0.0.1:8080,http://127.0.0.1:4321,http://127.0.0.1:3000",
        validation_alias="ALLOW_ORIGINS",
    )
    app_timezone: str = Field(default="UTC", validation_alias="APP_TIMEZONE")
    payment_webhook_token: str = Field(
        default="dev-webhook-token", validation_alias="PAYMENT_WEBHOOK_TOKEN"
    )
    auth_token_ttl_minutes: int = Field(default=720, validation_alias="AUTH_TOKEN_TTL_MINUTES")
    auth_secret_key: str = Field(
        default="dev-insecure-secret-change", validation_alias="AUTH_SECRET_KEY"
    )
    auth_algorithm: str = Field(default="HS256", validation_alias="AUTH_ALGORITHM")
    cors_allow_all: bool = Field(default=False, validation_alias="CORS_ALLOW_ALL")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="",
        extra="ignore",
        case_sensitive=False,
    )

    @property
    def cors_origins_list(self) -> list[str]:
        raw = self.backend_cors_origins
        if not raw:
            return ["http://localhost:8080", "http://localhost:4321", "http://localhost:3000"]
        return [item.strip() for item in raw.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
