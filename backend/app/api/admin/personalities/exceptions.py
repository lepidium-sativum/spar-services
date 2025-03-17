from .constants import ErrorCode
from app.core.exceptions import NotFound, BadRequest


class PersonalityNotFound(NotFound):
    DETAIL = ErrorCode.PERSONALITY_NOT_FOUND


class PersonalityAlreadyExists(BadRequest):
    DETAIL = ErrorCode.PERSONALITY_ALREADY_EXISTS
