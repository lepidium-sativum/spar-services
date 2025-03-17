from typing import TYPE_CHECKING
from app.core.dependencies import DBSessionDep
from .exceptions import InvalidCredentials, UserBanned
from .models import UserLogin, AccessTokenResponse
from .security.hash import verify_password
from .security.jwt import create_jwt_token
from .config import get_auth_config

if TYPE_CHECKING:
    from ..spar.users.models import User


def authenticate_a_user(db: DBSessionDep, user: UserLogin) -> "User":
    from ..spar.users.models import User
    from ..spar.users.exceptions import UserNotFound

    _user = User.get_by_username(db, user.username)
    if not _user:
        raise UserNotFound(original_error=user.username)

    if _user.disabled:
        raise UserBanned()

    return _user


def verify_a_password(password, hashed_password):
    if not verify_password(password, hashed_password):
        raise InvalidCredentials()


def create_a_token(db: DBSessionDep, user: UserLogin):
    # 1.Authenticate user
    #     a. Get User from DB
    #     b. Compare password hash
    #     c. Check if user is not blocked
    _user = authenticate_a_user(db, user)
    verify_a_password(user.password, _user.hashed_password)

    # 2. Create Access & Refresh tokens
    access_token = create_jwt_token(
        data={"sub": _user.username, "role": _user.role},
        expires_delta=get_auth_config().jwt_token_exp,
    )
    refresh_token = create_jwt_token(
        data={"sub": _user.username, "role": _user.role},
        expires_delta=get_auth_config().jwt_refresh_token_exp,
    )
    return AccessTokenResponse(access_token=access_token, refresh_token=refresh_token)
