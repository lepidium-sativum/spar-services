from fastapi import Depends  # Request
from typing import Annotated, TYPE_CHECKING
from fastapi.security import OAuth2PasswordBearer

from app.core.dependencies import DBSessionDep
from .config import get_auth_config, AuthConfig
from .models import UserLogin
from .service import authenticate_a_user
from .exceptions import AuthorizationFailed
from .security.jwt import decode_token

if TYPE_CHECKING:
    from ..spar.users.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/tokens")
AuthConfigDep = Annotated[AuthConfig, Depends(get_auth_config)]
TokenDep = Annotated[str, Depends(oauth2_scheme)]


def get_current_user(session: DBSessionDep, token: TokenDep) -> "User":
    payload = decode_token(token)
    # token_data = UserLogin(**payload)
    token_data = UserLogin(username=payload["sub"], password="")
    user = authenticate_a_user(db=session, user=token_data)
    return user


class RoleChecker:
    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles

    def __call__(
        self,
        user: Annotated["User", Depends(get_current_user)],  # request: Request
    ):
        if user.role in self.allowed_roles:
            # request.state.current_user = user
            return user  # True
        raise AuthorizationFailed


NormalUserDep = Annotated["User", Depends(get_current_user)]
AdminUserDep = Annotated[
    "User", Depends(RoleChecker(allowed_roles=["admin"]))
]  # [bool, Depends(RoleChecker(allowed_roles=["admin"])]
