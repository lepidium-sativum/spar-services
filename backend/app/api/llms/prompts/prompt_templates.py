from pybars import Compiler
from app.core.exceptions import DetailedHTTPException
from app.core.logger import logger
from ..exceptions import (
    TemplateNotFound,
    TemplateMissingPlaceholder,
)
from .config import (
    SECTION_INSTRUCTIONS,
    SECTION_OBJECTIVE,
    SECTION_WHO,
    SECTION_CONSIDERATIONS,
    SECTION_GRADING,
    SECTION_EXAMPLE,
)
from .blocks import (
    get_block_basic_considerations,
    get_block_interaction_rules,
    get_block_request_integer_output,
    get_block_performance_boost,
)


def get_interaction_prompt():
    return {
        "SECTION_INSTRUCTIONS": SECTION_INSTRUCTIONS,
        "SECTION_WHO": SECTION_WHO,
        "SECTION_OBJECTIVE": SECTION_OBJECTIVE,
        "SECTION_CONSIDERATIONS": SECTION_CONSIDERATIONS,
        "get_block_interaction_rules": get_block_interaction_rules(),
        "get_block_basic_considerations": get_block_basic_considerations(),
    }


def get_grader_prompt(grading: str | None = None) -> dict[str, str]:
    return {
        "SECTION_INSTRUCTIONS": SECTION_INSTRUCTIONS,
        "SECTION_GRADING": SECTION_GRADING,
        "SECTION_CONSIDERATIONS": SECTION_CONSIDERATIONS,
        "get_block_request_integer_output": get_block_request_integer_output(),
        "get_block_performance_boost": get_block_performance_boost(),
        "grading_criteria": grading or "",
    }


def get_expand_objective_prompt():
    return {
        "SECTION_INSTRUCTIONS": SECTION_INSTRUCTIONS,
        "SECTION_EXAMPLE": SECTION_EXAMPLE,
        "SECTION_CONSIDERATIONS": SECTION_CONSIDERATIONS,
        "get_block_performance_boost": get_block_performance_boost(),
    }


def get_binary_assessor_prompt(what_is_yes_what_is_no=None) -> dict[str, str]:
    return {
        "SECTION_INSTRUCTIONS": SECTION_INSTRUCTIONS,
        "SECTION_OBJECTIVE": SECTION_OBJECTIVE,
        "SECTION_CONSIDERATIONS": SECTION_CONSIDERATIONS,
        "get_block_request_integer_output": get_block_request_integer_output(),
        "get_block_performance_boost": get_block_performance_boost(),
        "what_is_yes_what_is_no": what_is_yes_what_is_no or "",
    }


def get_coach_assessor_prompt(
    employee_name: str | None = None,
) -> dict[str, str]:
    return {
        "SECTION_INSTRUCTIONS": SECTION_INSTRUCTIONS,
        "SECTION_OBJECTIVE": SECTION_OBJECTIVE,
        "get_block_performance_boost": get_block_performance_boost(),
        # "how_to_assess_objective": how_to_assess_objective,
        "employee_name": employee_name
        or "{{employee_name}}",  # to be filled during analysis
    }


prompt_templates_data: dict[str, dict[str, str]] = {
    "interaction_prompt": get_interaction_prompt(),
    "grader_prompt": get_grader_prompt(),
    "expand_objective_prompt": get_expand_objective_prompt(),
    "binary_assessor_prompt": get_binary_assessor_prompt(),
    "coach_assessor_prompt": get_coach_assessor_prompt(),
}


def get_prompt_template(file_path: str, template_name: str, filled: bool, **kwargs):
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            template_content = file.read()
            template_data = prompt_templates_data.get(template_name, {})
            template_data.update(kwargs)
            if filled:
                compiler = Compiler()
                template = compiler.compile(template_content)
                filled_prompt = template(template_data)
                return filled_prompt
            else:
                template_data["template"] = template_content
                return template_data
    except FileNotFoundError as e:
        logger.exception(e)
        raise TemplateNotFound()
    except KeyError as e:
        raise TemplateMissingPlaceholder(original_error=str(e))
    except Exception as e:
        logger.exception(e)
        raise DetailedHTTPException()
