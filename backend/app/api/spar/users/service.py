# from typing import TYPE_CHECKING
from sqlmodel import select, desc
from app.core.dependencies import DBSessionDep
from app.core.exceptions import DetailedHTTPException
from app.core.logger import logger
from .exceptions import UserNotFound, UserAlreadyExists
from ...auth.security.hash import get_password_hash
from sqlalchemy.exc import IntegrityError
from .models import UserCreate, User


# TODO: Check if the user already exists
def create_a_user(db: DBSessionDep, user: UserCreate):
    try:
        hashed_password = get_password_hash(user.password)
        extra_data = {"hashed_password": hashed_password}
        user_to_db = User.model_validate(user, update=extra_data)
        # Only SuperAdmin should be able to create accounts with “Admin” or other roles
        # if user_to_db.role != UserRole.user:
        # raise ActionNotAllowed
        db.add(user_to_db)
        db.commit()
        db.refresh(user_to_db)
        return user_to_db
    except IntegrityError as e:
        logger.exception(e)
        db.rollback()
        raise UserAlreadyExists()
    except Exception as e:
        logger.exception(e)
        raise DetailedHTTPException()


def read_a_user(db: DBSessionDep, user_id: int):
    user = db.get(User, user_id)
    if not user:
        raise UserNotFound(original_error=str(user_id))
    return user


def read_all_users(db: DBSessionDep):
    users = db.exec(select(User).order_by(desc(User.created_at))).all()
    return users


def delete_a_user(db: DBSessionDep, user_id: int):
    user = db.get(User, user_id)
    if not user:
        raise UserNotFound()
    db.delete(user)
    db.commit()
    return {"ok": True}
