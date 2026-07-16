"""Application configuration using Pydantic Settings."""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralized application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_env: str = Field(default="development")
    app_debug: bool = Field(default=False)
    app_name: str = Field(default="PromptVault")
    app_version: str = Field(default="0.1.0")

    # Server
    backend_url: str = Field(default="http://localhost:8000")
    frontend_url: str = Field(default="http://localhost:3000")
    cors_origins: list[str] = Field(default=["http://localhost:3000"])

    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://promptvault:promptvault@localhost:5432/promptvault"
    )

    # Auth (future)
    jwt_secret: str = Field(default="change-me-to-a-secure-random-string")
    jwt_algorithm: str = Field(default="HS256")
    jwt_expiration_minutes: int = Field(default=30)

    # Cloudinary (future)
    cloudinary_cloud_name: str = Field(default="")
    cloudinary_api_key: str = Field(default="")
    cloudinary_api_secret: str = Field(default="")

    # Stripe (future)
    stripe_secret_key: str = Field(default="")
    stripe_publishable_key: str = Field(default="")
    stripe_webhook_secret: str = Field(default="")

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def resolved_database_url(self) -> str:
        import os
        url = self.database_url
        if not os.path.exists("/.dockerenv") and "@db:5432" in url:
            return url.replace("@db:5432", "@localhost:5433")
        return url


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached application settings singleton."""
    return Settings()
