from typing import Tuple
from groq import Groq
from ..config import get_llm_config
from ..util import initialize_system_in_chatTable, add_content_to_chatTable
from app.core.logger import logger


api_key = get_llm_config().groq_api_key
groq_sales_client = Groq(api_key=api_key)


def generate_groq_response(
    user_message,
    prompt,
    model,
    max_tokens,
    temperature=get_llm_config().default_temperature,
) -> Tuple[str, bool]:
    content = initialize_system_in_chatTable(prompt)
    content = add_content_to_chatTable(user_message, "user", content)
    return generate_response(
        content=content,
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
    )


def generate_response(
    content,
    model=get_llm_config().groq_model_lama70,
    max_tokens=get_llm_config().groq_default_tokens,
    temperature=get_llm_config().groq_default_temperature,
) -> Tuple[str, bool]:
    try:
        chat_response = groq_sales_client.chat.completions.create(
            model=model,
            messages=content,
            stop=["[INST]"],
            temperature=temperature,
            max_tokens=max_tokens,
            top_p=get_llm_config().groq_top_p,
        )
        return chat_response.choices[0].message.content
    except Exception as e:
        logger.error(str(e))
        raise e
