from textwrap import dedent

from anthropic import Anthropic
from mirascope.core import anthropic, openai, prompt_template

from mirascope.retries.tenacity import collect_errors
from mirascope.integrations.langfuse import with_langfuse
from openai import OpenAI
from tenacity import retry, stop_after_attempt

from app.api.llms.config import get_llm_config
from app.api.spar.analysis.report_schema import BaseReport


@prompt_template()
def feedback_prompt_fn(
    user_role: str,
    avatar_role: str,
    roleplay_prompt: str,
    timestamped_tagged_conversation: str,
    objectives_str: str,
) -> str:
    return dedent(
        f"""\
You are an expert training coach. Your task is to provide feedback to a trainee who is practicing as a {user_role} speaking with an AI roleplaying as a {avatar_role}.
You will be given the roleplay prompt fed into the AI, the conversation between the trainee and the AI, the learning objectives, and the assessment template for you to fill in.

### START OF ROLEPLAY CONTEXT GIVEN TO THE AI ###
{roleplay_prompt}
### END OF ROLEPLAY CONTEXT GIVEN TO THE AI ###

### START OF ROLEPLAY CONVERSATION ###
{timestamped_tagged_conversation}
### END OF ROLEPLAY CONVERSATION ###

### START OF OBJECTIVES TO ACHIEVE ###
{objectives_str}
### END OF OBJECTIVES TO ACHIEVE ###

### FEEDBACK TEMPLATE TO FILL IN ###

# 1. Learning Objectives Analysis
For each objective defined in the module:

### [Objective title]
- **Summary** in one or two sentences maximum
- **Evidence and Analysis**: Direct quotes showing achievement or missed opportunities, in the format of:
```
[timestamp] Speaker: Quote showing achievement or missed opportunity
ANALYSIS: Why this demonstrates achievement or needs improvement. Have an encouraging tone in both cases. If it's a missed opportunity, try to suggest a better response if it's possible.
```
Example timestamp: [01:03-01:12] (start time - end time)
Make sure you don't write duplicate quotes/analyses, only provide analyses that are distinct from each other.
- **Improvement Actions**: Specific, actionable recommendations
- **Score**: [1-10]

# 2. Key Metrics
For each key metric defined below, provide a brief analysis (1 - 2 sentences) of the performance with respect to the metric. Some metrics will have some tips on how to analyze the performance.
After each metric's analysis, provide a score from 1-10.

### Engagement
How to analyze: Check for existence OR absence of things like:
- Questions that build upon customer's previous statements
- Use of relevant details from earlier in the conversation in later responses
- Confirmation/clarification questions that show comprehension
- Missed opportunities where relevant follow-ups should have occurred

### Solution Accuracy
How to analyze:
- Whether the trainee provided correct product information
- If they addressed all customer questions
- Whether they needed to "check and get back" on basic questions

### Emotional Intelligence
How to analyze:
- Existence/absence of Empathy markers ("I understand why you'd feel that way")
- Adaptation to customer's emotional state
- Professional handling of objections

### Professional Conduct


# 3. Communication Pattern Analysis
- Top Strengths (1-2 sentences maximum)
- Growth Areas (1-2 sentences maximum)

#### END OF FEEDBACK TEMPLATE TO FILL IN ####"""
    )


# TODO: Add Response Time Analysis


@with_langfuse()
def get_feedback_anthropic(
    user_role: str,
    avatar_role: str,
    roleplay_prompt: str,
    timestamped_tagged_conversation: str,
    objectives_str: str,
):
    return anthropic.call(
        model="claude-3-5-sonnet-latest",
        call_params=anthropic.AnthropicCallParams(max_tokens=2048),
        client=Anthropic(api_key=get_llm_config().claude_api_key),
    )(feedback_prompt_fn)(
        user_role,
        avatar_role,
        roleplay_prompt,
        timestamped_tagged_conversation,
        objectives_str,
    )


@with_langfuse()
def get_feedback_openai(
    user_role: str,
    avatar_role: str,
    roleplay_prompt: str,
    timestamped_tagged_conversation: str,
    objectives_str: str,
):
    return openai.call(
        model=get_llm_config().openai_gpt4o_model_name,
        call_params=openai.OpenAICallParams(max_tokens=2048),
        client=OpenAI(api_key=get_llm_config().openai_api_key),
    )(feedback_prompt_fn)(
        user_role,
        avatar_role,
        roleplay_prompt,
        timestamped_tagged_conversation,
        objectives_str,
    )


# TODO: Add retry, and check if generated report is str, then try to model_validate it


@retry(
    stop=stop_after_attempt(3),
    after=collect_errors(ValueError),
    # retry_error_callback=emotion_retry_error_callback,
)
@with_langfuse()
@anthropic.call(
    model=get_llm_config().claude_model_name,
    call_params=anthropic.AnthropicCallParams(max_tokens=2048),
    response_model=BaseReport,
    client=Anthropic(api_key=get_llm_config().claude_api_key),
)
@prompt_template(
    dedent(
        """\
    You are an expert data extractor. You will be given two assessment reports about the same training session, your task is to extract the data from them given the format specified.
    ----- IMPORTANT -----
    - Do not make up any data, only extract the data from the reports.
    - Do not duplicate data, merge the information from the two reports
    - Do not skip any of the objectives or metrics
    - Do not alter the data, only extract it using the JSON format provided
    - Prefer the data from the first report if there is a conflict
    - In extremely rare cases, if a field is missing in both reports, leave it blank / default for that field

    ----- START OF REPORT 1 -----
    {anthropic_feedback}
    ----- END OF REPORT 1 -----

    ----- START OF REPORT 2 -----
    {openai_feedback}
    ----- END OF REPORT 2 -----

    {previous_errors}
"""
    )
)
def extract_feedback(
    anthropic_feedback: str,
    openai_feedback: str,
    *,
    errors: list[ValueError] | None = None,
) -> anthropic.AnthropicDynamicConfig:
    previous_errors = f"Previous Errors: {errors}" if errors else ""
    return {"computed_fields": {"previous_errors": previous_errors}}
