from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from app.core.dependencies import DBSessionDep
from app.core.exceptions import DetailedHTTPException
from app.core.logger import logger
from .models import Analysis, AnalysisCreate, AnalysisUpdate
from .exceptions import AnalysisNotFound, AnalysisAlreadyExists


def create_a_analysis(db: DBSessionDep, analysis: AnalysisCreate):
    try:
        analysis_to_db = Analysis.model_validate(analysis)
        db.add(analysis_to_db)
        db.commit()
        db.refresh(analysis_to_db)
        return analysis_to_db
    except IntegrityError as e:
        logger.exception(e)
        db.rollback()
        raise AnalysisAlreadyExists()
    except Exception as e:
        logger.exception(e)
        raise DetailedHTTPException()


def read_a_analysis(db: DBSessionDep, analysis_id: int):
    analysis = db.get(Analysis, analysis_id)
    if not analysis:
        raise AnalysisNotFound(original_error=str(analysis_id))
    return analysis


def read_a_analysis_with_sparid(db: DBSessionDep, spar_id: int):
    statement = select(Analysis).where(Analysis.spar_id == spar_id)
    results = db.exec(statement)
    analysis = results.one_or_none()
    if not analysis:
        raise AnalysisNotFound(original_error=str(spar_id))
    return analysis


def update_analysis(
    db: DBSessionDep, analysis_to_update: Analysis, analysis_to_db: AnalysisUpdate
):
    spar_data = analysis_to_db.model_dump(exclude_unset=True)
    for key, value in spar_data.items():
        setattr(analysis_to_update, key, value)

    db.add(analysis_to_update)
    db.commit()
    db.refresh(analysis_to_update)
    return analysis_to_update


def read_a_analysis_with_spar_id(db: DBSessionDep, spar_id: int):
    analysis = db.exec(select(Analysis).where((Analysis.spar_id == spar_id))).first()
    return analysis
