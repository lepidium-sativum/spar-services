from .constants import ErrorCode
from app.core.exceptions import BadRequest, NotAuthenticated, PermissionDenied


class AuthRequired(NotAuthenticated):
    DETAIL = ErrorCode.AUTHENTICATION_REQUIRED


class AuthorizationFailed(PermissionDenied):
    DETAIL = ErrorCode.AUTHORIZATION_FAILED


class InvalidToken(NotAuthenticated):
    DETAIL = ErrorCode.INVALID_TOKEN


class InvalidCredentials(NotAuthenticated):
    DETAIL = ErrorCode.INVALID_CREDENTIALS


class UserBanned(PermissionDenied):
    DETAIL = ErrorCode.USER_BANNED


class EmailTaken(BadRequest):
    DETAIL = ErrorCode.EMAIL_TAKEN


class UsernameTaken(BadRequest):
    DETAIL = ErrorCode.USERNAME_TAKEN


class RefreshTokenNotValid(NotAuthenticated):
    DETAIL = ErrorCode.REFRESH_TOKEN_NOT_VALID


class JWTSignatureExpired(NotAuthenticated):
    DETAIL = ErrorCode.TOKEN_EXPIRED


class JWTInvalidToken(NotAuthenticated):
    DETAIL = ErrorCode.INVALID_TOKEN


class ActionNotAllowed(NotAuthenticated):
    DETAIL = ErrorCode.ACTION_NOT_ALLOWED


class SettingRoleNotAllowed(BadRequest):
    DETAIL = ErrorCode.SETTING_ROLE_NOT_ALLOWED
