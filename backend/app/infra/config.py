from functools import lru_cache
from pydantic_settings import BaseSettings
from app.core.config import get_base_model_config


class InfraConfig(BaseSettings):
    ue_server_username: str | None = None
    ue_server_password: str | None = None
    no_of_standby_ue_instances: int = 0
    azure_username: str | None = None
    azure_client_id: str | None = None
    azure_secret: str | None = None
    bastion_hostname: str | None = None
    bastion_username: str | None = None
    bastion_private_key: str | None = None

    model_config = get_base_model_config()


@lru_cache
def get_infra_config():
    return InfraConfig()
