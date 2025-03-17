from sqlmodel import select, text
from typing import Any
from sqlalchemy import delete

from app.core.dependencies import DBSessionDep
from app.api.auth.dependencies import NormalUserDep
from app.core.exceptions import DetailedHTTPException
from .exceptions import SparNotFound, SparUserOwnedNotFound, SparAlreadyExists
from app.core.logger import logger
from .models import (
    Spar,
    SparCreate,
    SparUpdate,
    SparMediaId,
    SparVideoStateUpdate,
    SparMergedAudioTimeline,
)
from sqlalchemy.exc import IntegrityError
from ..users.models import UserRole


def create_a_spar(db: DBSessionDep, user_id: int, spar: SparCreate):
    try:
        spar.user_id = user_id
        spar_to_db = Spar.model_validate(spar)
        db.add(spar_to_db)
        db.commit()
        db.refresh(spar_to_db)
        return spar_to_db
    except IntegrityError as e:
        logger.exception(e)
        db.rollback()
        raise SparAlreadyExists()
    except Exception as e:
        logger.exception(e)
        raise DetailedHTTPException()


def read_user_spars(db: DBSessionDep, user_id: int, offset: int, limit: int):
    spars = db.exec(
        select(Spar).where(Spar.user_id == user_id).offset(offset).limit(limit)
    ).all()
    return spars


def read_a_spar(db: DBSessionDep, spar_id: int):
    spar = db.get(Spar, spar_id)
    if not spar:
        raise SparNotFound(original_error=str(spar_id))
    return spar


def read_user_owned_spar(db: DBSessionDep, spar_id: int, user: NormalUserDep):
    #     spar = db.exec(
    #         select(Spar).where((Spar.id == spar_id) & (Spar.user_id == user_id))
    #     ).first()
    spar = read_a_spar(db=db, spar_id=spar_id)

    if not spar or (spar.user_id != user.id):
        raise SparUserOwnedNotFound()
    return spar


def read_user_owned_or_admin_spar(db: DBSessionDep, spar_id: int, user: NormalUserDep):
    spar = read_a_spar(db=db, spar_id=spar_id)
    user_role = user.role

    if not (
        spar
        and (
            spar.user_id == user.id
            or (user_role in (UserRole.admin, UserRole.superadmin))
        )
    ):
        raise SparUserOwnedNotFound()
    return spar


def update_a_spar(db: DBSessionDep, spar_to_update: Spar, spar_to_db: SparUpdate):
    # spar_to_update = db.get(Spar, spar_id)
    # if not spar_to_update:
    #     raise SparNotFound()
    spar_data = spar_to_db.model_dump(exclude_unset=True)
    return update_spar_in_db(db, spar_to_update, spar_data)


def update_a_spar_video_state(
    db: DBSessionDep, spar_to_update: Spar, spar_to_db: SparVideoStateUpdate
):
    spar_data = spar_to_db.model_dump(exclude_unset=True)
    return update_spar_in_db(db, spar_to_update, spar_data)


def update_media_ids_in_spar(
    db: DBSessionDep, spar_to_update: Spar, spar_to_db: SparMediaId
):
    spar_data = spar_to_db.model_dump(exclude_unset=True)
    return update_spar_in_db(db, spar_to_update, spar_data)


def update_media_timeline_in_spar(
    db: DBSessionDep,
    spar_to_update: Spar,
    spar_to_db: SparMergedAudioTimeline,
):
    spar_data = spar_to_db.model_dump(exclude_unset=True)
    return update_spar_in_db(db, spar_to_update, spar_data)


def update_spar_in_db(
    db: DBSessionDep, spar_to_update: Spar, spar_data: dict[str, Any]
):
    for key, value in spar_data.items():
        setattr(spar_to_update, key, value)

    db.add(spar_to_update)
    db.commit()
    db.refresh(spar_to_update)
    return spar_to_update


def read_in_progress_spars(db: DBSessionDep):
    result = db.exec(
        text("SELECT COUNT(*) FROM spar WHERE state IN ('started', 'in_progress');")
    ).one_or_none()
    spars_in_progress_count = result[0] if result else None
    return spars_in_progress_count


def mark_spars_finished(db: DBSessionDep):
    result = db.exec(
        text(
            "UPDATE public.spar SET state='finished' WHERE state IN ('started', 'in_progress');"
        )
    )
    db.commit()
    return result


def delete_a_spar(db: DBSessionDep, spar_id: int):
    spar = db.get(Spar, spar_id)
    if not spar:
        raise SparNotFound()
    db.delete(spar)
    db.commit()
    return {"ok": True}


def delete_all_spars(db: DBSessionDep, module_id: int):
    db.exec(delete(Spar).where(Spar.module_id == module_id))
    db.commit()
    return {"ok": True}
