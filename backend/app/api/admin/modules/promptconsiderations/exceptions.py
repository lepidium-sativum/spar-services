from .constants import ErrorCode
from app.core.exceptions import NotFound, BadRequest


class ConsiderationNotFound(NotFound):
    DETAIL = ErrorCode.CONSIDERATION_NOT_FOUND


class ConsiderationAlreadyExists(BadRequest):
    DETAIL = ErrorCode.CONSIDERATION_ALREADY_EXISTS
