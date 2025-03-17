from .constants import ErrorCode
from app.core.exceptions import DetailedHTTPException


class StartingLLMFailed(DetailedHTTPException):
    DETAIL = ErrorCode.STARTING_LLM_FAILED


class StoppingLLMFailed(DetailedHTTPException):
    DETAIL = ErrorCode.STOPPING_LLM_FAILED


class StartingUEFailed(DetailedHTTPException):
    DETAIL = ErrorCode.STARTING_UE_FAILED


class StoppingUEFailed(DetailedHTTPException):
    DETAIL = ErrorCode.STOPPING_UE_FAILED
