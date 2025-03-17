from sqlmodel import text

from app.core.dependencies import DBSessionDep
from app.core.logger import logger
from .models import Health, Status


def get_health(db: DBSessionDep) -> Health:
    db_status = health_db(db=db)
    logger.info("%s.get_health.db_status: %s", __name__, db_status)
    return Health(app_status=Status.OK, db_status=db_status)


def health_db(db: DBSessionDep) -> Status:
    try:
        db.exec(text("SELECT 1;")).one_or_none()
        return Status.OK
    except Exception as e:
        logger.exception(e)
        return Status.NOK
