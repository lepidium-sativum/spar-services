from fastapi import APIRouter, Query

from app.core.dependencies import DBSessionDep

from .controller import (
    create_aiavatar_controller,
    delete_aiavatar_controller,
    get_aiavatar_controller,
    get_all_aiavatars_controller,
)
from .models import AIAvatarCreate, AIAvatarRead  # AIAvatarUpdate

router = APIRouter()


@router.post("", response_model=AIAvatarRead)
def create_aiavatar(db: DBSessionDep, aiavatar: AIAvatarCreate):
    """
    Create an AIAvatar.
    """
    return create_aiavatar_controller(db=db, aiavatar=aiavatar)


@router.get("", response_model=[])  # list[AIAvatarRead]
def get_all_aiavatars(
    db: DBSessionDep,
    offset: int = 0,
    limit: int = Query(default=1000, lte=1000),
):
    return get_all_aiavatars_controller(db=db, offset=offset, limit=limit)


@router.get("/{aiavatar_id}")  # response_model=AIAvatarRead
def get_aiavatar(db: DBSessionDep, aiavatar_id: int):
    return get_aiavatar_controller(db=db, aiavatar_id=aiavatar_id)


@router.delete("/{aiavatar_id}")
def delete_aiavatar(db: DBSessionDep, aiavatar_id: int):
    """
    Delete an avatar.
    """
    return delete_aiavatar_controller(db=db, aiavatar_id=aiavatar_id)
