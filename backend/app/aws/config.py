from functools import lru_cache
from pydantic_settings import BaseSettings
from app.core.config import get_base_model_config


class AWSConfig(BaseSettings):
    s3_access_key: str
    s3_secret_key: str
    s3_region: str
    s3_media_bucket: str
    s3_metahumans_bucket: str
    s3_bg_images_bucket: str
    model_config = get_base_model_config()


@lru_cache
def get_aws_config():
    return AWSConfig()
