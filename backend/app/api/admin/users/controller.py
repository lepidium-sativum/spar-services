from app.core.dependencies import DBSessionDep
from app.api.spar.users.models import UserCreate
from app.api.spar.users.service import create_a_user, read_all_users, delete_a_user


def create_account_controller(db: DBSessionDep, user: UserCreate):
    return create_a_user(db=db, user=user)


def get_all_users_controller(db: DBSessionDep):
    return read_all_users(db=db)


def delete_user_controller(db: DBSessionDep, user_id: int):
    return delete_a_user(db=db, user_id=user_id)
