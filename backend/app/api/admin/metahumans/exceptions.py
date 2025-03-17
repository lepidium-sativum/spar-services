from .constants import ErrorCode
from app.core.exceptions import NotFound, BadRequest


class MHNotFound(NotFound):
    DETAIL = ErrorCode.MH_NOT_FOUND


class MHAlreadyExists(BadRequest):
    DETAIL = ErrorCode.MH_ALREADY_EXISTS


class S3ImageNotFound(BadRequest):
    DETAIL = ErrorCode.S3_IMAGE_NOT_FOUND
