from functools import lru_cache
from pydantic_settings import BaseSettings
from app.core.config import get_base_model_config


class ExternalServiceConfig(BaseSettings):
    tts_base_url: str
    tts_port: int
    azure_stt_key: str
    azure_stt_region: str

    assembly_api_key: str
    deepgram_api_key: str
    model_config = get_base_model_config()


@lru_cache
def get_external_service_config():
    return ExternalServiceConfig()
