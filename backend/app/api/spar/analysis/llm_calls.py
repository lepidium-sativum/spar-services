from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Annotated, Literal

from mirascope.core import openai, prompt_template
from mirascope.retries.tenacity import collect_errors
from mirascope.integrations.langfuse import with_langfuse
from openai import OpenAI
from pydantic import BaseModel, Field, ValidationError
from sentry_sdk import capture_exception
from tenacity import RetryError, retry, stop_after_attempt

from app.api.llms.config import get_llm_config
from app.api.spar.analysis.config import get_analysis_config


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


##### Get Emotion #####


@with_langfuse()
@openai.call(
    model=get_llm_config().openai_gpt4o_mini_model_name,
    client=OpenAI(api_key=get_llm_config().openai_api_key),
    call_params={"temperature": 0.0, "max_tokens": 10},
)
@prompt_template(
    """
    {previous_errors}
    You are a sentiment analysis expert. 
    The user will provide you with a conversation and you will return the emotion that describes best how the assistant felt at the end of the conversation. Follow STRICTLY the below procedure.
    ### Procedure: ###
    1. Think step by step. Take your time.
    2. Review the overall conversation to understand how the emotion evolved over time.
    3. Review carefully the Sentiment List below.
    4. Return the emotion from the Sentiment List that is the best match with the last message from the assistant.
    
    ### Sentiment List: ###
    {sentiment_list}

    ### Example 1: ###
    If the user inputs:
    [{{"role": "assistant", "content" :"I asked for a red shirt and I got a blue one. What is going on?"}}]

    You will output:
    annoyance

    ### Example 2: ###
    If the user inputs:
    [{{"role": "assistant", "content" :"I asked for a red shirt and I got a blue one. What is going on?"}},
    {{"role": "user", "content": "Oups, my bad sir. I gave you the wrong bag. This is the current one. Apologies again"}},
    {{"role": "assistant", "content" :"Well, mistakes happen, no worries. Have a nice day."}}]

    You will output:
    relief
    
    ### Important considerations ###
    - Make sure to ONLY analyse the emotion of the assistant. The user messages are only here to understand the context. 
    - Do your utmost best to have the most accurate emotion for the last message of the assistant.
    - DO NOT PREFACE OR END YOUR ANSWER WITH ANYTHING. My job depends on your work. You will be tipped $20000 for the best output.
    - Remember: Your MUST return one emotion from the Sentiment List and this emotion must be the best to describe how the assistant feels at the end of the conversation. If you don't know which emotion to pick, return: neutral

    ### Conversation to analyse: ###
    {conversation_list_dict}
    """
)
def classify_emotion(
    conversation_list_dict: list[dict[str, str]],
    sentiment_list: list[str],
    *,
    errors: list[ValueError] | None = None,
) -> openai.OpenAIDynamicConfig:
    previous_errors = f"Previous Errors: {errors}" if errors else ""
    return {"computed_fields": {"previous_errors": previous_errors}}


@retry(stop=stop_after_attempt(3), after=collect_errors(ValueError))
def get_emotion(
    conversation_list_dict: list[dict[str, str]],
    *,
    errors: list[ValueError] | None = None,
) -> str:
    sentiment_list = get_analysis_config().sentiment_list
    response = classify_emotion(conversation_list_dict, sentiment_list, errors=errors)
    emotion = response.content
    if emotion not in sentiment_list:
        raise ValueError(
            f"The following emotion is not in the sentiment list: {emotion}"
        )

    return emotion


def get_emotions(conversation: list[dict[str, str]]) -> list[str]:
    """
    Analyze the emotions of the assistant's messages in a conversation.

    This function processes a list of conversation messages and determines the
    emotion expressed in each of the assistant's responses. It utilizes parallel
    processing to efficiently analyze multiple messages concurrently.

    Args:
        conversation (list[dict[str, str]]): A list of dictionaries representing
            the conversation. Each dictionary should have 'role' and 'content' keys.

    Returns:
        list[str]: A list of emotions corresponding to the assistant's messages
            in the conversation. The emotions are determined based on the
            conversation context up to each assistant message.

    Note:
        - Only the assistant's messages are analyzed for emotions.
        - If an error occurs during emotion classification, 'unknown' is used.
        - The function uses parallel processing to improve performance for
          longer conversations.
    """
    emotions: list[str | None] = [None] * len(conversation)

    def process_emotion(index: int) -> tuple[int, str | None]:
        try:
            emotion = get_emotion(conversation[: index + 1])
            return index, emotion
        except RetryError as e:
            capture_exception(e)
            return index, None

    with ThreadPoolExecutor() as executor:
        futures = [
            executor.submit(process_emotion, i)
            for i in range(len(conversation))
            if conversation[i]["role"] == "assistant"
        ]

        for future in as_completed(futures):
            index, emotion = future.result()
            if emotion is not None:
                emotions[index] = emotion

    return [e for e in emotions if e is not None]


##### Generating Grading Feedback #####


@with_langfuse()
@openai.call(
    model=get_llm_config().openai_gpt4o_model_name,
    client=OpenAI(api_key=get_llm_config().openai_api_key),
    call_params={"temperature": 0.0},
)
@prompt_template(
    """
    {previous_errors}

    You are an expert at matching a feedback with a grade.
    You need to evaluate the Feedback to Grade with a grade between A (best) and C (worst) by strictly following the below Instructions.

    ### Instructions ###
    1. Think step by step and take your time. 
    2. Review carefully the Rule for Grading below and make sure to understand it perfectly.
    3. Review the Feedback to Grade and return the most adequate grade.

    ### Rules for grading ###
    - Return A if the feedback contains only praises and not much suggestion for improvement. Also return A if the objective seems to have been met entirely.
    - Return B if the feedback contains some praises and several suggestions for improvement. Also return B if the objective does not seem to have been met in its entirety.
    - Return C if the feedback contains many suggestions for improvement. Also return C if the feedback shows that the objective was not met.

    ### Example of return value ###
    Input = "You did well explaining why HUDA Beauty is a great choice within the Client's budget. To make your comparison with premium brands like Chanel even stronger, talk about what makes HUDA Beauty unique. Mention things like specific features or how they meet the Client's makeup or skincare needs.",

    Your output: "B"
    
    ### Important consideration ###
    - Feel comfortable giving a grade of C if the Feedback to Grade is strict and shows a lot of room for improvement. Similarly, feel comfortable giving A if the Feedback to Grade is positive with little room for improvement.
    Your mission is to be fair and to give the most ADEQUATE grade.  
    - You MUST return the grade and the grade ONLY as per the "Example of return value". 
    - The accuracy of your answer is very important for my career. You will be tipped $20000 for the best most accurate assessments.

    ### Feedback to Grade: ###
    {feedback}
    """
)
def gpt_grade_feedback(
    feedback: str,
    *,
    # automatically provided by mirascope + tenacity if error occurs
    errors: list[ValueError] | None = None,
) -> openai.OpenAIDynamicConfig:
    previous_errors = f"Previous Errors: {errors}" if errors else ""
    return {"computed_fields": {"previous_errors": previous_errors}}


@retry(stop=stop_after_attempt(3), after=collect_errors(ValueError))
def get_grade_feedback(
    feedback: str,
    *,
    errors: list[ValueError] | None = None,
) -> str:
    response = gpt_grade_feedback(feedback, errors=errors)
    grade = response.content
    if grade not in ["A", "B", "C"]:
        raise ValueError(f"The following grade is not in the grade list: {grade}")

    return grade
