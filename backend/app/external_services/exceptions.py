from .constants import ErrorCode
from app.core.exceptions import DetailedHTTPException


class InvalidAWSCredentials(DetailedHTTPException):
    DETAIL = ErrorCode.INVALID_AWS_CREDENTIALS
