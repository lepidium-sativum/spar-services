from functools import lru_cache
from pydantic_settings import BaseSettings
from app.core.config import get_base_model_config


class InstanceConfig(BaseSettings):
    llm_instance_id: int | None = None
    no_of_standby_ue_instances: int | None = None
    model_config = get_base_model_config()


@lru_cache
def get_instance_config():
    return InstanceConfig()
