from sqlmodel import select, desc
from sqlalchemy.exc import IntegrityError

from app.core.dependencies import DBSessionDep
from app.core.exceptions import DetailedHTTPException
from app.core.logger import logger
from .exceptions import ObjectiveNotFound, ObjectiveAlreadyExists
from .models import Objective, ObjectiveCreate


def create_an_objective(db: DBSessionDep, objective: ObjectiveCreate):
    try:
        obj_to_db = Objective.model_validate(objective)
        db.add(obj_to_db)
        db.commit()
        db.refresh(obj_to_db)
        return obj_to_db
    except IntegrityError as e:
        logger.exception(e)
        db.rollback()
        raise ObjectiveAlreadyExists()
    except Exception as e:
        logger.exception(e)
        raise DetailedHTTPException()


def read_all_objectives(db: DBSessionDep):
    objectives = db.exec(select(Objective).order_by(desc(Objective.created_at))).all()
    return objectives


def delete_an_objective(db: DBSessionDep, objective_id: int):
    objective = db.get(Objective, objective_id)
    if not objective:
        raise ObjectiveNotFound()
    db.delete(objective)
    db.commit()
    return {"ok": True}
