from functools import lru_cache
from pydantic_settings import BaseSettings
from app.core.config import get_base_model_config


class LLMConfig(BaseSettings):
    sales_llm_llama3_base_url: str

    groq_api_key: str
    groq_model_lama70: str
    groq_model_lama8: str
    groq_default_temperature: float
    groq_default_tokens: int
    groq_top_p: int

    openai_api_key: str
    openai_gpt4o_model_name: str
    openai_gpt4o_mini_model_name: str

    claude_api_key: str
    claude_model_name: str

    default_output_tokens_small: int
    default_output_tokens_tiny: int

    default_temperature: float

    langfuse_public_key: str | None = None
    langfuse_secret_key: str | None = None

    model_config = get_base_model_config()


@lru_cache
def get_llm_config():
    return LLMConfig()
