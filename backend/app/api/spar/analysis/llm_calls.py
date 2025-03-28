from typing import Annotated, Literal

from mirascope.core import openai, prompt_template
from mirascope.retries.tenacity import collect_errors
from mirascope.integrations.langfuse import with_langfuse
from openai import OpenAI
from pydantic import BaseModel, Field, ValidationError
from tenacity import retry, stop_after_attempt

from app.api.llms.config import get_llm_config


##### Guess Speaker Role #####


class SpeakerRole(BaseModel):
    reasoning: str = Field(..., description="Reason for the role classification")
    speaker_role: Annotated[
        Literal["user", "assistant"],
        Field(..., description="The speaker's role, either 'user' or 'assistant'"),
    ]


@with_langfuse()
@retry(stop=stop_after_attempt(3), after=collect_errors(ValidationError))
@openai.call(
    model=get_llm_config().openai_gpt4o_model_name,
    response_model=SpeakerRole,
    client=OpenAI(api_key=get_llm_config().openai_api_key),
    call_params={"temperature": 0.0},
)
@prompt_template(
    """
    {previous_errors}

    You are an AI assistant tasked with determining whether a given transcript belongs to the user or the assistant. You will be given three transcripts:
    - The transcript of the user's conversation
    - The transcript of the assistant's conversation
    - The transcript you are asked to identify the speaker of
    You must return the role of the speaker in the transcript you are asked to identify.

    ===== USER TRANSCRIPT START =====
    {user_transcript}
    ===== USER TRANSCRIPT END =====

    ===== ASSISTANT TRANSCRIPT START =====
    {assistant_transcript}
    ===== ASSISTANT TRANSCRIPT END =====

    ===== TRANSCRIPT TO IDENTIFY START =====
    {transcript_to_identify}
    ===== TRANSCRIPT TO IDENTIFY END =====
    """
)
def gpt_speaker_guesser(
    user_transcript: str,
    assistant_transcript: str,
    transcript_to_identify: str,
    *,
    # automatically provided by mirascope + tenacity if error occurs
    errors: list[ValidationError] | None = None,
) -> openai.OpenAIDynamicConfig:
    previous_errors = f"Previous Errors: {errors}" if errors else ""
    return {"computed_fields": {"previous_errors": previous_errors}}
