from .constants import ErrorCode
from app.core.exceptions import DetailedHTTPException


class InvalidAWSCredentials(DetailedHTTPException):
    DETAIL = ErrorCode.INVALID_AWS_CREDENTIALS


class S3SignedUrlFailed(DetailedHTTPException):
    DETAIL = ErrorCode.S3_SIGNED_URL_FAILED


class S3DownloadFailed(DetailedHTTPException):
    DETAIL = ErrorCode.S3_DOWNLOAD_FAILED


class S3UploadFailed(DetailedHTTPException):
    DETAIL = ErrorCode.S3_UPLOAD_FAILED


class S3MetaFailed(DetailedHTTPException):
    DETAIL = ErrorCode.S3_FILE_META_FAILED


class UrlFileDownloadFailed(DetailedHTTPException):
    DETAIL = ErrorCode.URL_FILE_DOWNLOAD_FAILED


class UrlFileS3UploadFailed(DetailedHTTPException):
    DETAIL = ErrorCode.URL_FILE_S3_UPLOAD_FAILED
