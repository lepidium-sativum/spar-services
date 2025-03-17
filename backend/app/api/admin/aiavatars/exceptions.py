from .constants import ErrorCode
from app.core.exceptions import NotFound, BadRequest


class AIAvatarNotFound(NotFound):
    DETAIL = ErrorCode.AIAVATAR_NOT_FOUND


class AIAvatarAlreadyExists(BadRequest):
    DETAIL = ErrorCode.AIAVATAR_ALREADY_EXISTS
