import json
import os
from functools import lru_cache

from pydantic import PostgresDsn, RedisDsn, ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict

from app import __version__

from .constants import Environment


class SparBaseConfig(BaseSettings):
    environment: Environment
    server_name: str = "SPAR API"
    server_port: int
    app_version: str = __version__
    api_version: str = "1"

    sentry_dsn: str

    redis_url: RedisDsn

    db_user: str
    db_password: str
    db_host: str
    db_port: int
    db_name: str
    model_config = SettingsConfigDict(extra="ignore")
    run_migrations: bool = False

    @property
    def sqlalchemy_db_uri(self) -> PostgresDsn:
        return PostgresDsn.build(
            scheme="postgresql+psycopg2",
            username=self.db_user,
            password=self.db_password,
            host=self.db_host,
            port=self.db_port,
            path=self.db_name or "",
        )


def load_env_vars(env: Environment | None = None):
    env_str = os.getenv("SPAR_ENVIRONMENT", "LOCAL").upper()
    env = Environment(env_str)
    print(env)
    if env != Environment.LOCAL:
        if os.getenv("SPAR_SECRETS"):
            secret_vars = json.loads(os.getenv("SPAR_SECRETS"))
            for key, value in secret_vars.items():
                os.environ[key] = value

        if os.getenv("SPAR_CONFIGS"):
            config_vars = json.loads(os.getenv("SPAR_CONFIGS"))
            for key, value in config_vars.items():
                os.environ[key] = value


@lru_cache
def get_base_config() -> SparBaseConfig:
    try:
        env_str = os.getenv("SPAR_ENVIRONMENT", "LOCAL").upper()
        env = Environment(env_str)
        if env != Environment.LOCAL:
            return SparBaseConfig(environment=env)
        else:
            env_file = f".env.{env.value.lower()}" if env != Environment.LOCAL else ".env"
            print(f"Loading environment-specific file: {env_file}")

        class DynamicSparBaseConfig(SparBaseConfig):
            model_config = SettingsConfigDict(env_file=env_file, extra="ignore")

        return DynamicSparBaseConfig(environment=env)
    except ValidationError as e:
        print("Validation Error Details:")
        print(e.errors())
        raise e


@lru_cache
def get_base_model_config():
    config = get_base_config()
    print(f"Loading environment: {config.environment}")
    return config.model_config
