from openai import AsyncOpenAI, OpenAI
from typing import AsyncGenerator, Tuple
from ..config import get_llm_config
from ..constants import ErrorCode
from app.core.logger import logger

api_key = "blank"
base_url = f"{get_llm_config().sales_llm_llama3_base_url}/v1"
sales_llm_llama3 = OpenAI(api_key=api_key, base_url=base_url)
async_sales_llm_llama3 = AsyncOpenAI(api_key=api_key, base_url=base_url)


async def generate_response(
    content,
    llm_model_style: str,
    llm_model_temperature: float,
    extra_body: dict | None = None,
) -> Tuple[str, bool]:
    logger.debug("non-streaming LLM called")

    try:
        chat_response = sales_llm_llama3.chat.completions.create(
            model=llm_model_style,
            messages=content,
            stop=["[INST]"],
            temperature=llm_model_temperature,
            extra_body=extra_body,
        )
        return (chat_response.choices[0].message.content, False)
    except Exception:
        return (ErrorCode.LLM_NOT_CONNECTED, True)


async def generate_streaming_response(
    conversation_history,
    llm_model_style: str,
    llm_model_temperature: float,
    extra_body: dict | None = None,
) -> AsyncGenerator[str, None]:
    try:
        logger.debug("Streaming response initiated...")
        async for chunk in await async_sales_llm_llama3.chat.completions.create(
            model=llm_model_style,
            messages=conversation_history,
            stop=["[INST]"],
            stream=True,
            temperature=llm_model_temperature,
            extra_body=extra_body,
        ):
            if chunk.choices and (new_content := chunk.choices[0].delta.content):
                yield new_content
    except Exception as e:
        raise Exception(ErrorCode.LLM_NOT_CONNECTED) from e


async def generate_streaming_response_with_assistant_prefill(
    conversation_history,
    llm_model_style: str,
    llm_model_temperature: float,
    prefilled_assistant_response: str | None,
) -> AsyncGenerator[str, None]:
    if not prefilled_assistant_response:
        # No prefilled text, just stream regularly and return
        async for chunk in generate_streaming_response(
            conversation_history=conversation_history,
            llm_model_style=llm_model_style,
            llm_model_temperature=llm_model_temperature,
        ):
            yield chunk
        return
    # Add prefilled assistant response to the conversation history
    conversation_history = [
        *conversation_history,
        {"role": "assistant", "content": prefilled_assistant_response},
    ]
    extra_body = {"add_generation_prompt": False, "continue_final_message": True}
    text_stream = generate_streaming_response(
        conversation_history=conversation_history,
        llm_model_style=llm_model_style,
        llm_model_temperature=llm_model_temperature,
        extra_body=extra_body,
    )

    async for chunk in text_stream:
        yield chunk
