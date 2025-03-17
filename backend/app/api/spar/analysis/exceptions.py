from .constants import ErrorCode
from app.core.exceptions import NotFound, BadRequest, DetailedHTTPException


class AnalysisNotFound(NotFound):
    DETAIL = ErrorCode.ANALYSIS_NOT_FOUND


class AnalysisAlreadyExists(BadRequest):
    DETAIL = ErrorCode.ANALYSIS_ALREADY_EXISTS


class AnalysisGenerationFailed(DetailedHTTPException):
    DETAIL = ErrorCode.ANALYSIS_GENERATION_FAILED


class AnalysisDataNotFound(BadRequest):
    DETAIL = ErrorCode.ANALYSIS_DATA_NOT_FOUND
