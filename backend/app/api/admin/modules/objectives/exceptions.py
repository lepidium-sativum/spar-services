from .constants import ErrorCode
from app.core.exceptions import NotFound, BadRequest


class ObjectiveNotFound(NotFound):
    DETAIL = ErrorCode.OBJECTIVE_NOT_FOUND


class ObjectiveAlreadyExists(BadRequest):
    DETAIL = ErrorCode.OBJECTIVE_ALREADY_EXISTS
