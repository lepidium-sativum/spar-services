from fastapi import APIRouter
from typing import List
from app.core.dependencies import DBSessionDep
from .controller import (
    create_account_controller,
    get_all_users_controller,
    delete_user_controller,
)
from app.api.spar.users.models import UserCreate, UserRead

router = APIRouter()


@router.post("/register", response_model=UserRead)
def create_account(db: DBSessionDep, user: UserCreate):
    """
    Register a new user.
    """
    return create_account_controller(db=db, user=user)


@router.get("", response_model=List[UserRead])
def get_all_users(db: DBSessionDep):
    """
    Get all users.
    """
    return get_all_users_controller(db=db)


@router.delete("/{user_id}")
def delete_a_user(db: DBSessionDep, user_id: int):
    """
    Delete a user.
    """
    return delete_user_controller(db=db, user_id=user_id)
