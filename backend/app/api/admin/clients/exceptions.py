from .constants import ErrorCode
from app.core.exceptions import NotFound, BadRequest


class ClientNotFound(NotFound):
    DETAIL = ErrorCode.CLIENT_NOT_FOUND


class ClientAlreadyExists(BadRequest):
    DETAIL = ErrorCode.CLIENT_ALREADY_EXISTS
