from .constants import ErrorCode
from app.core.exceptions import NotFound, BadRequest


class SceneNotFound(NotFound):
    DETAIL = ErrorCode.SCENE_NOT_FOUND


class SceneAlreadyExists(BadRequest):
    DETAIL = ErrorCode.SCENE_ALREADY_EXISTS


class S3ImageNotFound(BadRequest):
    DETAIL = ErrorCode.S3_IMAGE_NOT_FOUND
