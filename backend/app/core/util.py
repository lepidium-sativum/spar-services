import ast
import json
import math
import re
from datetime import datetime
from typing import Any, Optional, Union

import numpy as np
import pandas as pd
from fastapi import responses

from .config import get_base_config
from .logger import logger

optimal_wpm = 145
upper_threshold = optimal_wpm + 60
lower_threshold = optimal_wpm - 60


class JSONResponseWIP(responses.JSONResponse):
    def render(self, content) -> bytes:
        if content is None:
            modified_content = {"status": "WIP on this API"}
        else:
            modified_content = content
        return super().render(modified_content)


start_tags = "|".join(re.escape(tag) for tag in ["<", "&lt;", "_"])
end_tags = "|".join(re.escape(tag) for tag in [">", "&gt;", "_"])


def remove_tags(json_str: str, tags) -> str:
    if not json_str:
        return ""
    main_tags = "|".join(re.escape(tag) for tag in tags)
    pattern = re.compile(
        r"^\s*({start})?({main})({end})?:?\s*".format(start=start_tags, main=main_tags, end=end_tags),
        re.IGNORECASE,
    )
    return pattern.sub("", json_str)


def remove_tags_from_the_middle(json_str: str, tags, strip: bool = False) -> str:
    if not json_str:
        return ""
    pattern = re.compile(
        r"<?({})>?:.*".format("|".join(re.escape(tag) for tag in tags)),
        re.IGNORECASE,
    )
    # Remove occurrences of the tag and everything after it
    result = pattern.sub("", json_str)
    return result.strip() if strip else result


def replaceBadEscape(input: str) -> str:
    return (
        input.replace("&", "&amp;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def remove_excess(text: str) -> str:
    """
    Replaces all occurrences of double newlines ('\n\n') and double spaces with single newline and space, respectively.
    """
    double_jump = "\n\n"
    double_space = "  "
    while double_jump in text:
        text = text.replace(double_jump, "\n")
    while double_space in text:
        text = text.replace(double_space, " ")
    return text


def clean_list_output(description: str) -> str:
    """
    Checks if a string contains "[]" or "1. 2. 3." and removes them.
    """
    cleaned_description = re.sub(r"\[.*?\]", "", description)
    cleaned_description = re.sub(r"\d+\.\s", "", cleaned_description)
    return cleaned_description.strip()


def scalar(v1_as_list: list, v2_as_list: list) -> float:
    """
    Built it function of numpy to return the scalar product of two vectors.
    """
    try:
        v1 = np.array(v1_as_list)
        v2 = np.array(v2_as_list)
        if v1.shape[0] > v2.shape[0]:
            v2 = np.pad(v2, (0, v1.shape[0] - v2.shape[0]), "constant")
        elif v1.shape[0] < v2.shape[0]:
            v1 = np.pad(v1, (0, v2.shape[0] - v1.shape[0]), "constant")
        return np.dot(v1, v2)
    except Exception as e:
        logger.error(
            f"Exception with scalar: {e} * Type v1:{type(v1)} v2:{type(v2)} *  Actual Vectors:v 1={v1} \n**\n v2={v2}"
        )
        return 0


def extract_dict_from_str(s: str) -> dict | None:
    """
    Attempts to parse a string into a dictionary using ast.literal_eval first,
    then json.loads if the first attempt fails. Logs and returns None if both attempts fail.
    """
    try:
        x = ast.literal_eval(s)
        if isinstance(x, dict):
            return x
    except Exception:
        pass
    try:
        x = json.loads(s)
        if isinstance(x, dict):
            return x
        else:
            logger.error(f"Issue with both ast.eval and json.loads. Input Data: {type(s)} * {s}")
            return None
    except Exception:
        logger.error(f"Issue with both ast.eval and json.loads. Input Data: {type(s)} * {s}")
        return None


def try_json_loads(s: str) -> Any | None:
    """
    Try / Except around the json loads
    """
    try:
        return json.loads(s)
    except Exception as e:
        logger.error(f"Issue with try_json_loads. Exception: {e} * Input Data: {s}")
        return None


def get_now(exact: bool = False) -> str:
    """
    Small function to get the timestamp in string format.
    By default we return the following format: "10_Jan_2023" but if exact is True, we will return 10_Jan_2023_@15h23s33
    """
    now = datetime.now()
    return datetime.strftime(now, "%d_%b_%Y@%Hh%Ms%S") if exact else datetime.strftime(now, "%d_%b_%Y")


def create_redis_spar_key(user_id: int, spar_id: int):
    return f"{get_base_config().db_name}:user_{user_id}:spar_{spar_id}"


def from_json_to_pd(json_data: Union[list, dict]) -> Optional[pd.DataFrame]:
    """
    Convert JSON data to a pandas DataFrame.

    Args:
        json_data (Union[list, dict]): JSON data to be converted.

    Returns:
        pd.DataFrame: DataFrame created from the JSON data.
    """
    logger.info(type(json_data))
    if isinstance(json_data, list):
        return pd.DataFrame(json_data)
    elif isinstance(json_data, dict):
        return pd.read_json(json_data)


def count_words_in_list(df: pd.DataFrame, words_list: Optional[list] = None) -> pd.Series:
    """
    Count occurrences of words in a DataFrame, optionally filtering by a list of words.

    Args:
        df (pd.DataFrame): DataFrame containing word-level data.
        words_list (list, optional): List of words to filter. Defaults to None.

    Returns:
        pd.Series: Series containing word counts grouped by speaker and word.
    """
    if words_list is None:
        filler_df = df[~df["word"].str.lower().isin(["a", "the", "is", "this", "i", "to", "and"])]
    else:
        filler_df = df[df["word"].str.lower().isin(words_list)]

    # Group by speaker and count filler words for each speaker
    word_counts = filler_df.groupby(["speaker", "word"]).size().reset_index(name="count")

    return word_counts


def classify_wpm(wpm: float) -> int:
    # Standard deviation to approximate the drop to 90 score around 40 WPM from the peak
    std_dev = 25
    if lower_threshold <= wpm <= upper_threshold:
        score = math.exp(-((wpm - optimal_wpm) ** 2) / (2 * std_dev**2))
        # Scale to be in 0-100 range
        return int(score * 100)
    else:
        return 5


def conversation_into_transcript(conversation_as_list):
    """
    Transform a conversation in JSON format to the Speaker format.
    Args:
        conversation_as_list (list): List of dictionaries representing the conversation.
    Returns:
        str: Transformed conversation in the Speaker format.
    """
    speaker_format = ""
    for idx, utterance in enumerate(conversation_as_list):
        # for key, value in utterance.items():
        speaker_format += f"{utterance['role']}: {utterance['content']}\n"
    return speaker_format


def recursive_vars(obj, _seen=None):
    if _seen is None:
        _seen = set()

    if isinstance(obj, list):
        return [recursive_vars(item, _seen) for item in obj]
    elif hasattr(obj, "__dict__"):
        # Prevent infinite recursion
        if id(obj) in _seen:
            return "<Recursion Detected>"
        _seen.add(id(obj))
        obj_dict = {}
        for key, value in vars(obj).items():
            obj_dict[key] = recursive_vars(value, _seen)
        _seen.remove(id(obj))
        return obj_dict
    else:
        return obj
