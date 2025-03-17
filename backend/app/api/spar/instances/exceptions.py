from .constants import ErrorCode
from app.core.exceptions import BadRequest


class InstanceNotFound(BadRequest):
    DETAIL = ErrorCode.INSTANCE_NOT_FOUND


class InstanceAlreadyExists(BadRequest):
    DETAIL = ErrorCode.INSTANCE_ALREADY_EXISTS
