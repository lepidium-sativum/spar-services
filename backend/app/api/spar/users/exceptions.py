from .constants import ErrorCode
from app.core.exceptions import BadRequest


class UserNotFound(BadRequest):
    DETAIL = ErrorCode.USER_NOT_FOUND


class UserAlreadyExists(BadRequest):
    DETAIL = ErrorCode.USER_ALREADY_EXISTS
