import os

from .prompts.prompt_templates import get_prompt_template


def get_file_path(template_name):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    TEMPLATE_DIR = os.path.join(BASE_DIR, "prompts/templates")
    file_path = os.path.join(TEMPLATE_DIR, f"{template_name}.hbs")
    return file_path


def get_prompt_template_controller(template_name: str, filled: bool, **kwargs):
    file_path = get_file_path(template_name)
    return get_prompt_template(
        file_path=file_path, template_name=template_name, filled=filled, **kwargs
    )
