from app.core.dependencies import DBSessionDep
from app.api.spar.spars.service import (
    mark_spars_finished,
    read_user_spars,
    delete_a_spar,
    delete_all_spars,
)
from ...spar.spars.dependencies import ValidSparDep
from ...spar.spars.models import SparMediaMergedVideo
from app.aws.controller import get_media_download_signed_url_controller


def get_user_spars_controller(db: DBSessionDep, user_id: int, offset: int, limit: int):
    return read_user_spars(db=db, user_id=user_id, offset=offset, limit=limit)


def mark_all_spars_finished_controller(db: DBSessionDep):
    response = mark_spars_finished(db=db)
    return response


def get_merged_video_controller(user_id: int, spar: ValidSparDep):
    merged_video_url = ""
    if spar.merged_video_id:
        merged_video_url = get_media_download_signed_url_controller(
            file_key=f"{user_id}/{spar.id}/{spar.merged_video_id}.webm"
        )
    # return merged_video_url
    return SparMediaMergedVideo(merged_video_url=merged_video_url, spar=spar)


def delete_spar_controller(db: DBSessionDep, spar_id: int):
    return delete_a_spar(db=db, spar_id=spar_id)


def delete_all_spars_controller(db: DBSessionDep, module_id: int):
    return delete_all_spars(db=db, module_id=module_id)
