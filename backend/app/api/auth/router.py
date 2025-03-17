from typing import Annotated
from fastapi import APIRouter, Form

from app.core.dependencies import DBSessionDep
from .dependencies import NormalUserDep, AdminUserDep
from .models import UserLogin, AccessTokenResponse
from .controller import create_token_controller

router = APIRouter()


@router.post("/tokens", response_model=AccessTokenResponse)
def create_token(db: DBSessionDep, user: UserLogin):
    # def create_token(db: DBSessionDep, user: Annotated[UserLogin, Form()]):  # if using /docs
    return create_token_controller(db=db, user=user)


@router.post("/tokens/refresh", response_model=AccessTokenResponse)
# def refresh_token(user: UserLogin, db: DBSessionDep):  # config: AuthConfigDep
def refresh_token():
    # token_data: Annotated[tuple[User, str], Depends(validate_refresh_token)])
    # return refresh_a_token(db=db, user=user)
    """
    Refresh the token **(WIP)**
    """
    pass


@router.get("/tokens/revoke")
def revoke_token(db: DBSessionDep, user: NormalUserDep):
    """
    Revoke the token. Once done, user won't be able to call any API **(WIP)**
    """
    pass


@router.get("/test_user_role")  # response_model=UserRead
def test_user_role(user: NormalUserDep):
    return {"data": "This is important data for USER"}


@router.get("/test_admin_role")  # response_model=UserRead
def test_admin_role(user: AdminUserDep):
    return {"data": "This is important data for ADMIN"}
