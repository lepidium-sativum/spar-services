from typing import Any

from fastapi import HTTPException, status


class DetailedHTTPException(HTTPException):
    STATUS_CODE = status.HTTP_500_INTERNAL_SERVER_ERROR
    DETAIL = "Server error"

    def __init__(self, detail=None, original_error=None, **kwargs: dict[str, Any]) -> None:
        if detail is None:
            detail = getattr(self, "DETAIL", self.DETAIL)
        if original_error:
            detail = f"{detail}: {original_error}"
        super().__init__(status_code=self.STATUS_CODE, detail=detail, **kwargs)


class PermissionDenied(DetailedHTTPException):
    STATUS_CODE = status.HTTP_403_FORBIDDEN
    DETAIL = "Permission denied"


class NotFound(DetailedHTTPException):
    STATUS_CODE = status.HTTP_404_NOT_FOUND
    DETAIL = "Not found"


class BadRequest(DetailedHTTPException):
    STATUS_CODE = status.HTTP_400_BAD_REQUEST
    DETAIL = "Bad request"


class ResourceConflict(DetailedHTTPException):
    STATUS_CODE = status.HTTP_409_CONFLICT
    DETAIL = "Resource conflict"


class UnprocessableEntity(DetailedHTTPException):
    STATUS_CODE = status.HTTP_422_UNPROCESSABLE_ENTITY
    DETAIL = "Unprocessable message"


class NotAuthenticated(DetailedHTTPException):
    STATUS_CODE = status.HTTP_401_UNAUTHORIZED
    DETAIL = "User not authenticated"


class FailedDependency(DetailedHTTPException):
    STATUS_CODE = status.HTTP_424_FAILED_DEPENDENCY
    DETAIL = "Connection to dependent service failed"

    def __init__(self) -> None:
        super().__init__(headers={"WWW-Authenticate": "Bearer"})
