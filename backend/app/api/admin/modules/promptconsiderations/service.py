from sqlmodel import select, desc
from sqlalchemy.exc import IntegrityError

from app.core.dependencies import DBSessionDep
from app.core.exceptions import DetailedHTTPException
from app.core.logger import logger
from .exceptions import (
    ConsiderationNotFound,
    ConsiderationAlreadyExists,
)
from .models import (
    PromptConsideration,
    PromptConsiderationCreate,
)


def create_a_prompt_consideration(
    db: DBSessionDep, consideration: PromptConsiderationCreate
):
    try:
        obj_to_db = PromptConsideration.model_validate(consideration)
        db.add(obj_to_db)
        db.commit()
        db.refresh(obj_to_db)
        return obj_to_db
    except IntegrityError as e:
        logger.exception(e)
        db.rollback()
        raise ConsiderationAlreadyExists()
    except Exception as e:
        logger.exception(e)
        raise DetailedHTTPException()


def read_all_prompt_considerations(db: DBSessionDep):
    considerations = db.exec(
        select(PromptConsideration).order_by(desc(PromptConsideration.created_at))
    ).all()
    return considerations


def delete_a_prompt_consideration(db: DBSessionDep, consideration_id: int):
    consideration = db.get(PromptConsideration, consideration_id)
    if not consideration:
        raise ConsiderationNotFound()
    db.delete(consideration)
    db.commit()
    return {"ok": True}
