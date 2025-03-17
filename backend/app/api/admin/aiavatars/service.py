from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from sqlmodel import desc, select

from app.core.dependencies import DBSessionDep
from app.core.exceptions import DetailedHTTPException
from app.core.logger import logger

from .exceptions import AIAvatarAlreadyExists, AIAvatarNotFound
from .models import AIAvatar, AIAvatarCreate


def create_an_aiavatar(db: DBSessionDep, aiavatar: AIAvatarCreate):
    try:
        aiavatar_to_db = AIAvatar.model_validate(aiavatar)
        db.add(aiavatar_to_db)
        db.commit()
        db.refresh(aiavatar_to_db)
        return aiavatar_to_db
    except IntegrityError as e:
        logger.exception(e)
        db.rollback()
        raise AIAvatarAlreadyExists()
    except Exception as e:
        logger.exception(e)
        raise DetailedHTTPException()


def read_all_aiavatars(db: DBSessionDep, offset: int, limit: int):
    aiavatars = db.exec(
        select(AIAvatar)
        .options(
            selectinload(AIAvatar.metahuman),
            selectinload(AIAvatar.bgscene),
            selectinload(AIAvatar.personality),
        )
        .offset(offset)
        .limit(limit)
        .order_by(desc(AIAvatar.created_at))
    ).all()

    [AIAvatar.assign_signed_urls(aiavatar) for aiavatar in aiavatars]
    return [vars(avatar) for avatar in aiavatars]


def read_an_aiavatar(db: DBSessionDep, aiavatar_id: int):
    aiavatar = db.exec(
        select(AIAvatar)
        .options(
            selectinload(AIAvatar.metahuman),
            selectinload(AIAvatar.bgscene),
            selectinload(AIAvatar.personality),
        )
        .where(AIAvatar.id == aiavatar_id)
    ).first()
    if not aiavatar:
        raise AIAvatarNotFound(original_error=str(aiavatar_id))

    AIAvatar.assign_signed_urls(aiavatar)
    return vars(aiavatar)


def delete_an_aiavatar(db: DBSessionDep, aiavatar_id: int):
    aiavatar = db.get(AIAvatar, aiavatar_id)
    if not aiavatar:
        raise AIAvatarNotFound()
    db.delete(aiavatar)
    db.commit()
    return {"ok": True}
