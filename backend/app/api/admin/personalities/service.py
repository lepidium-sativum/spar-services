from sqlmodel import select, desc
from fastapi.encoders import jsonable_encoder

from app.core.dependencies import DBSessionDep
from app.core.exceptions import DetailedHTTPException
from app.core.logger import logger
from .exceptions import PersonalityNotFound, PersonalityAlreadyExists
from sqlalchemy.exc import IntegrityError
from .models import PersonalityCreate, Personality


def create_a_personality(db: DBSessionDep, personality: PersonalityCreate):
    try:
        personality_data = jsonable_encoder(personality)
        obj_to_db = Personality(**personality_data)
        # obj_to_db = Personality.model_validate(personality)
        db.add(obj_to_db)
        db.commit()
        db.refresh(obj_to_db)
        return obj_to_db
    except IntegrityError as e:
        logger.exception(e)
        db.rollback()
        raise PersonalityAlreadyExists()
    except Exception as e:
        logger.exception(e)
        raise DetailedHTTPException()


def read_all_personalities(db: DBSessionDep):
    personalities = db.exec(
        select(Personality).order_by(desc(Personality.created_at))
    ).all()
    return personalities


def read_a_personality(db: DBSessionDep, personality_id: int):
    personality = db.get(Personality, personality_id)
    if not personality:
        raise PersonalityNotFound(original_error=str(personality_id))
    return personality


def delete_a_personality(db: DBSessionDep, personality_id: int):
    personality = db.get(Personality, personality_id)
    if not personality:
        raise PersonalityNotFound()
    db.delete(personality)
    db.commit()
    return {"ok": True}
