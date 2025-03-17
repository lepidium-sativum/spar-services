from .constants import ErrorCode
from app.core.exceptions import NotFound, BadRequest, UnprocessableEntity


class SparNotFound(NotFound):
    DETAIL = ErrorCode.SPAR_NOT_FOUND


class SparUserOwnedNotFound(NotFound):
    DETAIL = ErrorCode.SPAR_USER_OWNED_NOT_FOUND


class SparAlreadyExists(BadRequest):
    DETAIL = ErrorCode.SPAR_ALREADY_EXISTS


class SparInvalidState(BadRequest):
    DETAIL = ErrorCode.SPAR_INVALID_STATE


class SparFailed(UnprocessableEntity):
    DETAIL = ErrorCode.SPAR_FAILED


class SparSucceeded(UnprocessableEntity):
    DETAIL = ErrorCode.SPAR_SUCCEEDED


class MediaFilesNotFound(BadRequest):
    DETAIL = ErrorCode.SPAR_FILES_NOT_UPLOADED


class SparNotFinished(BadRequest):
    DETAIL = ErrorCode.SPAR_NOT_FINISHED


class SparFilesNotAvailable(BadRequest):
    DETAIL = ErrorCode.SPAR_FILES_NOT_AVAILABLE
