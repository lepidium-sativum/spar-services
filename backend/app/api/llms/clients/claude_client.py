from typing import AsyncGenerator, Iterable

from anthropic import Anthropic, AsyncAnthropic
from anthropic.types import MessageParam


from ..config import get_llm_config


api_key = get_llm_config().claude_api_key
claude_client = Anthropic(api_key=api_key)
async_claude_client = AsyncAnthropic(api_key=api_key)


async def generate_streaming_response(
    content: Iterable[MessageParam], max_tokens: int, system_prompt: str = ""
) -> AsyncGenerator[str, None]:
    async with async_claude_client.messages.stream(
        max_tokens=max_tokens,
        model="claude-3-5-sonnet-latest",
        messages=content,
        system=system_prompt,
    ) as stream:
        async for chunk in stream.text_stream:
            yield chunk
