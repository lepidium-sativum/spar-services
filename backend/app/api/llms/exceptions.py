from .constants import ErrorCode
from app.core.exceptions import NotFound, DetailedHTTPException


class TemplateNotFound(NotFound):
    DETAIL = ErrorCode.TEMPLATE_NOT_FOUND


class TemplateMissingPlaceholder(NotFound):
    DETAIL = ErrorCode.TEMPLATE_MISSING_PLACEHOLDER


class GenericErrorMessage(DetailedHTTPException):
    DETAIL = ErrorCode.GENERIC_ERROR_MESSAGE
