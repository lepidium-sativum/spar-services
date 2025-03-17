from .constants import ErrorCode
from app.core.exceptions import DetailedHTTPException


class MergingVideosFailed(DetailedHTTPException):
    DETAIL = ErrorCode.MERGING_VIDEOS_FAILED


class MergingAudiosFailed(DetailedHTTPException):
    DETAIL = ErrorCode.MERGING_AUDIOS_FAILED
