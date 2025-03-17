from .constants import ErrorCode
from app.core.exceptions import NotFound, BadRequest


class ModuleNotFound(NotFound):
    DETAIL = ErrorCode.MODULE_NOT_FOUND


class ModuleAlreadyExists(BadRequest):
    DETAIL = ErrorCode.MODULE_ALREADY_EXISTS


class ObjectiveNotFound(NotFound):
    DETAIL = ErrorCode.OBJECTIVE_NOT_FOUND


class ObjectiveAlreadyExists(BadRequest):
    DETAIL = ErrorCode.OBJECTIVE_ALREADY_EXISTS


class ConsiderationNotFound(NotFound):
    DETAIL = ErrorCode.CONSIDERATION_NOT_FOUND


class ConsiderationAlreadyExists(BadRequest):
    DETAIL = ErrorCode.CONSIDERATION_ALREADY_EXISTS


class ModuleNotAssignedToUser(NotFound):
    DETAIL = ErrorCode.MODULE_NOT_ASSIGNED
