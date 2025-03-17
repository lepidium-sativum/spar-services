from fastapi import APIRouter, Query
from app.core.dependencies import DBSessionDep
from .controller import (
    mark_all_spars_finished_controller,
    get_user_spars_controller,
    get_merged_video_controller,
    delete_spar_controller,
    delete_all_spars_controller,
)
from ...spar.spars.models import SparRead, SparMediaMergedVideo
from ...spar.spars.dependencies import ValidUserOwnedOrAdminSparDep

router = APIRouter()


@router.get("/users/{user_id}", response_model=list[SparRead])
def get_user_spars(
    db: DBSessionDep,
    user_id: int,
    offset: int = 0,
    limit: int = Query(default=1000, lte=1000),
):
    """
    Retrieve all user's spars.
    """
    return get_user_spars_controller(db=db, user_id=user_id, offset=offset, limit=limit)


@router.put("/mark-all-spars-finished")
def mark_all_spars_finished(db: DBSessionDep):
    """
    Endpoint to mark all Sales SPARs finished.
    """
    return mark_all_spars_finished_controller(db=db)


@router.get("/{spar_id}/media/videos/download", response_model=SparMediaMergedVideo)
def get_merged_video(
    user_id: int,
    spar: ValidUserOwnedOrAdminSparDep,
):
    """
    Get the final merged video
    """
    return get_merged_video_controller(user_id=user_id, spar=spar)


@router.delete("/{spar_id}")
def delete_a_spar(db: DBSessionDep, spar_id: int):
    """
    Delete a spar.
    """
    return delete_spar_controller(db=db, spar_id=spar_id)


@router.delete("/modules/{module_id}")
def delete_all_spars(db: DBSessionDep, module_id: int):
    """
    Delete all spars of a module
    """
    return delete_all_spars_controller(db=db, module_id=module_id)
