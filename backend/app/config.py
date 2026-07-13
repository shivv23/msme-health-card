from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "mysql+aiomysql://root:password@localhost:3306/msme_health"
    GST_API_KEY: str = ""
    UPI_AGGREGATOR_KEY: str = ""
    EPFO_API_KEY: str = ""
    AA_GATEWAY_KEY: str = ""
    APP_SECRET: str = "change_this_in_production"
    JWT_SECRET: str = "change_this_jwt_secret"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    ML_MODEL_PATH: str = "./ml_model"
    APP_ENV: str = "development"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()
