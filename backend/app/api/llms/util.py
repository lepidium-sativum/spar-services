import random
import re
from .config import get_llm_config
from typing import Optional
from app.core.logger import logger


def safe_binary_choice_load(expected_binary_grade: str, verbose: bool = False) -> bool:
    """
    Returns False for 0 and True for 1 based on the expected binary grade string.
    If failed, returns False
    """
    match = re.search(r"\b([0-1])\b", expected_binary_grade)
    if match:
        return bool(int(match.group()))
    if verbose:
        logger.debug(
            f"No valid 0 or 1 found. This was the provided content: {expected_binary_grade}"
        )
    return False


def safe_grade_load(expected_grade: str, verbose=False) -> Optional[int]:
    """
    Returns the 1-10 grade by finding it in the LLM response.
    """
    match = re.search(r"\b([1-9]|10)\b", expected_grade)
    if match:
        grade = int(match.group())
        return grade
    if verbose:
        logger.debug(f"No grade found. This was the provided content {expected_grade}")


def initialize_system_in_chatTable(system_prompt: str) -> list[dict[str, str]]:
    """
    This function takes the system prompt as a input and returns it into the chat_table_format.
    """
    return [{"role": "system", "content": system_prompt}]


def add_content_to_chatTable(
    content: str, role: str, chatTable: list[dict[str, str]]
) -> list[dict[str, str]]:
    """
    Feeds a chatTable with the new query. Returns the new chatTable.
    Role is either 'assistant' when the AI is answering or 'user' when the user has a question.
    Added a security in case change of name.
    """
    new_chatTable = list(chatTable)
    normalized_role = role.lower()
    if normalized_role in ["user", "client"]:
        new_chatTable.append({"role": "user", "content": content})
    else:
        new_chatTable.append({"role": "assistant", "content": content})
    return new_chatTable


def append_chunk_smartly(accumulated_text, new_content):
    new_content = new_content.strip()
    if accumulated_text and accumulated_text[-1] not in [
        " ",
        ".",
        ",",
        "!",
        "?",
        ":",
        ";",
        "\n",
    ]:
        accumulated_text += " "
    accumulated_text += new_content
    accumulated_text = (
        accumulated_text.replace(" ,", ",")
        .replace(" .", ".")
        .replace(" ?", "?")
        .replace(" !", "!")
        .replace(" '", "'")
    )
    return accumulated_text
