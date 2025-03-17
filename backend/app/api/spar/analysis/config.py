from functools import lru_cache
from typing import Literal
from pydantic_settings import BaseSettings
from app.core.config import get_base_model_config


class AnalysisConfig(BaseSettings):
    aai: Literal["aai"] = "aai"
    dg: Literal["dg"] = "dg"
    used_audio_analysis_model: Literal["aai", "dg"] = "aai"
    dg_filler_words: list[str] = [
        "uh",
        "um",
        "mhmm",
        "mm-mm",
        "uh-uh",
        "uh-huh",
        "nuh-uh",
    ]
    aai_filler_words: list[str] = [
        "um",
        "uh",
        "hmm",
        "mhm",
        "uh-huh",
        "ah",
        "huh",
        "hm",
        "m",
    ]
    filler_words: list[str] = list(set(dg_filler_words).union(set(aai_filler_words)))
    emotion_grade_map: dict = {
        "disappointment": 20,
        "sadness": 25,
        "annoyance": 10,
        "neutral": 50,
        "disapproval": 15,
        "realization": 55,
        "nervousness": 30,
        "approval": 80,
        "joy": 90,
        "anger": 5,
        "embarrassment": 35,
        "caring": 75,
        "remorse": 40,
        "disgust": 10,
        "grief": 20,
        "confusion": 45,
        "relief": 70,
        "desire": 85,
        "admiration": 65,
        "optimism": 80,
        "fear": 15,
        "excitement": 95,
        "curiosity": 60,
        "amusement": 75,
        "surprise": 70,
        "gratitude": 85,
        "pride": 60,
        "satisfaction": 100,
        "confidence": 60,
        "acknowledgment": 60,
    }
    sentiment_list: list = list(emotion_grade_map.keys())
    # For proto it's a global var. In the future, it will be part of the DB (attached to each module)

    model_config = get_base_model_config()


@lru_cache
def get_analysis_config():
    return AnalysisConfig()
