from enum import Enum
from typing import Annotated
from anthropic import AsyncAnthropic
from mirascope.core import anthropic, prompt_template
from mirascope.integrations.langfuse import with_langfuse
from mirascope.retries.tenacity import collect_errors
from pydantic import BaseModel, Field, ValidationError
from tenacity import retry, stop_after_attempt

from app.api.llms.config import get_llm_config


class StakesLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class IndustryType(Enum):
    # We have the choice to fix these values or make the LLM generate them instead
    # Influences the scenario generation
    BANKING = "banking"
    INSURANCE = "insurance"
    AUTO_SALES = "auto_sales"
    REAL_ESTATE = "real_estate"
    LUXURY_RETAIL = "luxury_retail"


class ScenarioType(Enum):
    # We have the choice to fix these values or make the LLM generate them instead
    # Influences the scenario generation
    SALES = "sales"
    SUPPORT = "support"
    CONSULTATION = "consultation"
    COMPLAINT = "complaint"


class CustomerGoal(BaseModel):
    primary_goal: Annotated[
        str, Field(description="The main objective the customer wants to achieve")
    ]
    constraints: Annotated[
        list[str],
        Field(default_factory=list, description="Any limitations or requirements"),
    ]


class Scenario(BaseModel):
    title: Annotated[str, Field(description="Brief descriptive title")]
    situation: Annotated[str, Field(description="Initial scenario setup")]
    customer_goal: Annotated[CustomerGoal, Field(description="What the customer wants")]
    obstacles: Annotated[
        list[str],
        Field(default_factory=list, description="Complications in the scenario"),
    ]

    # Context for richer scenarios
    product_info: Annotated[
        dict[str, str],
        Field(
            default_factory=dict,
            description="Relevant product details for the scenario, if any",
        ),
    ]
    industry_context: Annotated[
        dict[str, str],
        Field(
            default_factory=dict,
            description="Relevant industry-specific information, if any",
        ),
    ]
    stakes_level: Annotated[StakesLevel, Field(description="Level of stakes involved")]

    industry: Annotated[IndustryType, Field(description="Industry context")]
    scenario_type: Annotated[ScenarioType, Field(description="Type of interaction")]


@with_langfuse()
@retry(stop=stop_after_attempt(3), after=collect_errors(ValidationError))
@anthropic.call(
    model=get_llm_config().claude_model_name,
    response_model=Scenario,
    client=AsyncAnthropic(api_key=get_llm_config().claude_api_key),
    call_params=anthropic.AnthropicCallParams(max_tokens=1500),
)
@prompt_template(
    """
    You are an expert in scenario generation. Given a prompt, your task is to use the information provided to generate a scenario in the specifed format.
    The prompt will not be perfect, so you will need to use your best judgement to fill in the missing information.
    Make good use of the customer_goal (primary_goal + constraints) and obstacles fields to be as close to the given prompt as possible, while being realistic and engaging.

    ### Prompt: ###
    {prompt}
    ### End Prompt ###

    {previous_errors}
    """
)
async def transform_prompt_to_new_format(
    prompt: str,
    *,
    errors: list[ValueError] | None = None,
) -> anthropic.AnthropicDynamicConfig:
    previous_errors = f"Previous Errors: {errors}" if errors else ""
    return {"computed_fields": {"previous_errors": previous_errors}}


def stringify_scenario(scenario: Scenario) -> str:
    scenario_description = []
    # Title
    scenario_description.append(f"Title: {scenario.title}")
    # Industry
    scenario_description.append(f"Industry: {scenario.industry.value}")
    # Scenario Type
    scenario_description.append(f"Scenario Type: {scenario.scenario_type.value}")
    # Situation
    scenario_description.append(f"Situation: {scenario.situation}")
    # Customer Goal and constraints
    scenario_description.append(f"Customer goal: {scenario.customer_goal.primary_goal}")
    if scenario.customer_goal.constraints:
        scenario_description.append("Customer constraints:")
        for constraint in scenario.customer_goal.constraints:
            scenario_description.append(f"- {constraint}")
    # Obstacles
    if scenario.obstacles:
        scenario_description.append("Obstacles:")
        for obstacle in scenario.obstacles:
            scenario_description.append(f"- {obstacle}")
    # Product Info
    if scenario.product_info:
        scenario_description.append("Product Info:")
        for product, info in scenario.product_info.items():
            scenario_description.append(f"- {product}: {info}")
    # Industry Context
    if scenario.industry_context:
        scenario_description.append("Industry Context:")
        for industry, info in scenario.industry_context.items():
            scenario_description.append(f"- {industry}: {info}")
    return "\n".join(scenario_description)
