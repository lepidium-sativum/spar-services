from openai import AsyncOpenAI
from mirascope.core import openai, prompt_template
from mirascope.retries.tenacity import collect_errors
from mirascope.integrations.langfuse import with_langfuse
from sentry_sdk import capture_message
from tenacity import RetryCallState, retry, stop_after_attempt

from app.api.llms.config import get_llm_config
from app.api.spar.modules.models import Emotion

# list of emotion values
EMOTIONS_LIST = [emotion.value for emotion in Emotion]


@with_langfuse()
@openai.call(
    model=get_llm_config().openai_gpt4o_mini_model_name,
    client=AsyncOpenAI(api_key=get_llm_config().openai_api_key),
    call_params={"temperature": 0.0, "max_tokens": 6},
)
@prompt_template(
    """
    {previous_errors}
    You are a sentiment analysis expert. 
    You will be provided with a Conversation for context and a message to analyse. You will determine the EMOTION of the provided message. Follow STRICTLY the below procedure.
    ### Procedure: ###
    1. Think step by step. Take your time.
    2. Review the conversation to understand the context.
    3. Analyze the provided message considering the context.
    4. Return the emotion that best matches the message. Only output the emotion, no other text.

    ### Emotions list: ###
    You may only choose from the following list of emotions:
    {emotions_list}

    ### Example 1: ###
    If the conversation is:
    assistant: I asked for a red shirt and I got a blue one. What is going on?
    user: Oups, my bad sir. I gave you the wrong bag. This is the current one. Apologies again

    And the message is:
    "I understand mistakes happen. Thank you for correcting it quickly."

    You will output: neutral

    ### Example 2: ###
    If the conversation is:
    assistant: Hello, does this come in black?
    user: Yes, and we also have a discount for that item!

    And the message is:
    "That's fantastic news! I'd love to see the black version with the discount."

    You will output: happy

    ### Important considerations ###
    - Use the conversation history to understand the context but focus on the message to determine its emotion.
    - Do your utmost best to determine the most accurate emotion. My job depends on your work. You will be tipped $200 for the best output.
    - Make sure to ONLY output the emotion, no other text.

    ### Conversation context: ###
    {conversation_text}

    ### Message to analyse: ###
    {message_text}
    """
)
async def predict_message_emotion(
    conversation_text: str,
    message_text: str,
    *,
    errors: list[ValueError] | None = None,
) -> openai.OpenAIDynamicConfig:
    previous_errors = f"Previous Errors: {errors}" if errors else ""
    return {
        "computed_fields": {
            "previous_errors": previous_errors,
            "emotions_list": EMOTIONS_LIST,
        }
    }


def emotion_retry_error_callback(state: RetryCallState) -> str:
    """Return "neutral" after 3 attempts"""
    capture_message(f"Emotion retry error callback:\n{state.kwargs=}")
    return "neutral"


@retry(
    stop=stop_after_attempt(3),
    after=collect_errors(ValueError),
    retry_error_callback=emotion_retry_error_callback,
)
async def get_message_emotion(
    conversation_text: str,
    message_text: str,
    *,
    errors: list[ValueError] | None = None,
) -> str:
    response = await predict_message_emotion(conversation_text, message_text, errors=errors)
    emotion = response.content
    if emotion not in EMOTIONS_LIST:
        raise ValueError(
            f"Your output is not a valid emotion. You must only output the emotion, no other text. The valid emotions are: {EMOTIONS_LIST}. You said: {emotion}"
        )

    return emotion
