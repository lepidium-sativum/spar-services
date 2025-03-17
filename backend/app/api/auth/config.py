from functools import lru_cache
from pydantic_settings import BaseSettings
from app.core.config import get_base_model_config


class AuthConfig(BaseSettings):
    jwt_alg: str
    jwt_secret: str
    jwt_refresh_token_key: str = "refreshToken"
    jwt_token_exp: int = 60 * 5  # 5 minutes
    jwt_refresh_token_exp: int = 60 * 60 * 2  # 2 hours
    jwt_secure_cookies: bool = True
    model_config = get_base_model_config()


@lru_cache
def get_auth_config():
    return AuthConfig()
