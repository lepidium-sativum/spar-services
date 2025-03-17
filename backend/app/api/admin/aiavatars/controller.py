from app.core.dependencies import DBSessionDep
from .service import create_an_aiavatar, read_all_aiavatars, read_an_aiavatar, delete_an_aiavatar

from .models import AIAvatarCreate


def create_aiavatar_controller(db: DBSessionDep, aiavatar: AIAvatarCreate):
    return create_an_aiavatar(db=db, aiavatar=aiavatar)


def get_all_aiavatars_controller(db: DBSessionDep, offset: int, limit: int):
    avatars = read_all_aiavatars(db=db, offset=offset, limit=limit)
    return avatars


def get_aiavatar_controller(db: DBSessionDep, aiavatar_id: int):
    avatar = read_an_aiavatar(db=db, aiavatar_id=aiavatar_id)
    return avatar


def delete_aiavatar_controller(db: DBSessionDep, aiavatar_id: int):
    return delete_an_aiavatar(db=db, aiavatar_id=aiavatar_id)
