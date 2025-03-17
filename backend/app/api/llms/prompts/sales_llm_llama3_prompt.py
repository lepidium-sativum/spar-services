from enum import Enum
import random


class ConversationStatus(Enum):
    SUCCESS = "success"
    FAILED = "failed"
    IN_PROGRESS = "in_progress"


ENDING_SALES_SUCCESS = ["goodbye", "bye"]
ENDING_SALES_FAILURE = ["i am leaving", "i'm leaving"]


def is_ended(message: str) -> ConversationStatus:
    message_lower = message.lower()
    if any(ending in message_lower for ending in ENDING_SALES_SUCCESS):
        return ConversationStatus.SUCCESS
    elif any(ending in message_lower for ending in ENDING_SALES_FAILURE):
        return ConversationStatus.FAILED
    else:
        return ConversationStatus.IN_PROGRESS


FIRST_MESSAGE_CLIENT_LLM = [
    "Hello. Are you available? I need some help.",
    "Hello. I need some assistance.",
    "Hello there, are you available?",
    "Hi. I need some help with a gift please.",
]


def generate_random_greeting_message(choices: list[str] | None = None):
    choices = choices or FIRST_MESSAGE_CLIENT_LLM
    return random.choice(choices)
