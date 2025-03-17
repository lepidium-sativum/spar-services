from sqlmodel import select, desc
from app.core.dependencies import DBSessionDep
from app.core.exceptions import DetailedHTTPException  # BadRequest
from app.core.logger import logger
from .exceptions import MHNotFound, MHAlreadyExists
from sqlalchemy.exc import IntegrityError
from .models import MetaHumanCreate, MetaHuman


def create_a_metahuman(db: DBSessionDep, mh: MetaHumanCreate):
    try:
        obj_to_db = MetaHuman.model_validate(mh)
        db.add(obj_to_db)
        db.commit()
        db.refresh(obj_to_db)
        return obj_to_db
    except IntegrityError as e:
        logger.exception(e)
        db.rollback()
        raise MHAlreadyExists()
    except Exception as e:
        logger.exception(e)
        raise DetailedHTTPException()
        # raise BadRequest(original_error=str(e))


def read_all_metahumans(db: DBSessionDep):
    metahumans = db.exec(select(MetaHuman).order_by(desc(MetaHuman.created_at))).all()
    return metahumans


def read_a_metahuman(db: DBSessionDep, mh_id: int):
    metahuman = db.get(MetaHuman, mh_id)
    if not metahuman:
        raise MHNotFound(original_error=str(mh_id))
    return metahuman


def delete_a_metahuman(db: DBSessionDep, mh_id: int):
    metahuman = db.get(MetaHuman, mh_id)
    if not metahuman:
        raise MHNotFound(original_error=str(mh_id))
    db.delete(metahuman)
    db.commit()
    return {"ok": True}
