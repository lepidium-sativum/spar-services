from .constants import ErrorCode
from app.core.exceptions import BadRequest


class RoomNotFound(BadRequest):
    DETAIL = ErrorCode.ROOM_NOT_FOUND


class RoomAlreadyExists(BadRequest):
    DETAIL = ErrorCode.ROOM_ALREADY_EXISTS


class NoMoreRoomsForUser(BadRequest):
    DETAIL = ErrorCode.NO_MORE_ROOMS_FOR_USER


class ResourcesNotAvailable(BadRequest):
    DETAIL = ErrorCode.RESOURCES_NOT_AVAILABLE
