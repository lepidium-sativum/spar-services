from app.core.dependencies import DBSessionDep
from .models import UserLogin
from .service import create_a_token


def create_token_controller(db: DBSessionDep, user: UserLogin):
    return create_a_token(db=db, user=user)
