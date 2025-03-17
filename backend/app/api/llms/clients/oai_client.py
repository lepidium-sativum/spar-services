from openai import OpenAI
from typing import Tuple

from sentry_sdk import capture_exception

from app.core.logger import logger
from ..config import get_llm_config
from ..util import initialize_system_in_chatTable, add_content_to_chatTable

# To be added in the env file
MODEL_EMB_LARGE = r"text-embedding-3-large"
MODEL_EMB_SMALL = r"text-embedding-3-small"

api_key = get_llm_config().openai_api_key
oai_client = OpenAI(api_key=api_key)


def generate_gpt4o_response(
    user_message,
    prompt,
    max_tokens=get_llm_config().default_output_tokens_small,
    temperature=get_llm_config().default_temperature,
) -> Tuple[str, bool]:
    content = initialize_system_in_chatTable(prompt)
    content = add_content_to_chatTable(user_message, "user", content)
    return generate_response(
        content=content,
        model=get_llm_config().openai_gpt4o_model_name,
        max_tokens=max_tokens,
        temperature=temperature,
    )


def generate_gpt4omini_response(
    user_message,
    prompt,
    max_tokens=get_llm_config().default_output_tokens_small,
    temperature=get_llm_config().default_temperature,
) -> Tuple[str, bool]:
    content = initialize_system_in_chatTable(prompt)
    content = add_content_to_chatTable(user_message, "user", content)
    return generate_response(
        content=content,
        model=get_llm_config().openai_gpt4o_mini_model_name,
        max_tokens=max_tokens,
        temperature=temperature,
    )


def generate_response(
    content,
    model: str,
    max_tokens: int,
    temperature: int,
) -> Tuple[str, bool]:
    try:
        chat_response = oai_client.chat.completions.create(
            model=model,
            messages=content,
            stop=["[INST]"],
            temperature=temperature,
            max_tokens=int(max_tokens),
        )
        return chat_response.choices[0].message.content
    except Exception as e:
        logger.error(str(e))
        raise e


def embed_text(text: str, max_attempts: int = 3, model=MODEL_EMB_LARGE) -> list[float]:
    """
    Micro function which returns the embedding of one chunk of text or None if issue.
    """
    if text == "":
        raise ValueError("Text is empty")
    # attempts = 0
    for attempt in range(max_attempts):
        try:
            res = oai_client.embeddings.create(model=model, input=text, encoding_format="float").data[0].embedding
            return res
        except Exception as e:
            logger.warning(f"OAI Embedding faced the exception {e} at attempt # {attempt} out of 3")
            capture_exception(e)
    else:
        raise ValueError(f"OAI Embedding failed all {max_attempts} attempts for text: {text}")
