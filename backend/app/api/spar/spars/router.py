from fastapi import APIRouter, BackgroundTasks, Query

from app.api.auth.dependencies import NormalUserDep
from app.core.dependencies import DBSessionDep

from .controller import (
    communicate_controller,
    create_merged_video_controller,
    create_spar_controller,
    get_download_urls_controller,
    get_merged_video_controller,
    get_spar_controller,
    get_upload_urls_controller,
    get_user_spars_controller,
    silence_controller,
    spar_video_merging_start_state_controller,
    update_spar_controller,
)
from .dependencies import ValidUserOwnedOrAdminSparDep, ValidUserOwnedSparDep
from .exceptions import SparFilesNotAvailable, SparNotFinished
from .models import (
    SparCommunicate,
    SparCreate,  # SparUpdatePayload,
    SparMedia,
    SparMediaMergedVideo,
    SparRead,
    SparReadToken,
    SparState,
    SparUpdate,
    SparVideoMergingState,
)

router = APIRouter()


@router.post("", response_model=SparReadToken)
async def create_spar(db: DBSessionDep, user: NormalUserDep, spar: SparCreate):
    """
    Create a new SPAR for user
    """
    return await create_spar_controller(db=db, user=user, spar=spar)


@router.get("", response_model=list[SparRead])
def get_user_spars(
    db: DBSessionDep,
    user: NormalUserDep,
    offset: int = 0,
    limit: int = Query(default=1000, lte=1000),
):
    """
    Retrieve all spars of a user
    """
    return get_user_spars_controller(db=db, user=user, offset=offset, limit=limit)


@router.get("/{spar_id}", response_model=SparRead)
def get_spar(
    db: DBSessionDep, user: NormalUserDep, spar_id: int
):  # spar: ValidUserOwnedSparDep
    """
    Retrieve a registered SPAR for client.
    """
    return get_spar_controller(db=db, user=user, spar_id=spar_id)


@router.patch("/{spar_id}", response_model=SparRead)
async def update_spar(
    db: DBSessionDep,
    user: NormalUserDep,
    spar_id: int,
    spar: ValidUserOwnedSparDep,
    spar_data: SparUpdate,
):  # TODO: SparDep
    """
    Update a client SPAR.
    """
    return await update_spar_controller(
        db=db, user=user, spar=spar, spar_data=spar_data
    )


@router.post("/{spar_id}/communicate-new")
async def communicate_new(user_id: int, spar_id: int, spar_comm: SparCommunicate):
    """
    Send the user's transcription to server for reply via Avatar.
    """
    return await communicate_controller(
        user_id=user_id, spar_id=spar_id, spar_comm=spar_comm
    )


@router.post("/{spar_id}/communicate")  # response_model=bool
async def communicate(
    user: NormalUserDep, spar: ValidUserOwnedSparDep, spar_comm: SparCommunicate
):
    """
    Send the user's transcription to server for reply via Avatar.
    """
    return await communicate_controller(user_id=user.id, spar_id=spar.id, spar_comm=spar_comm)


@router.post("/{spar_id}/silence")
async def silence(user: NormalUserDep, spar: ValidUserOwnedSparDep):
    """
    Make the assistant speak when the user is silent for a while.
    """
    return await silence_controller(user=user, spar=spar)


@router.get("/{spar_id}/media/upload", response_model=SparMedia)
def get_upload_urls(
    db: DBSessionDep, user: NormalUserDep, spar_id: int, spar: ValidUserOwnedSparDep
):
    """
    Get all the 4 upload URLs required to upload the media files (at the end of a SPAR/session)
    """
    return get_upload_urls_controller(db=db, user=user, spar_id=spar_id, spar=spar)


@router.get("/{spar_id}/media/download", response_model=SparMedia)
def get_download_urls(
    db: DBSessionDep, user: NormalUserDep, spar_id: int, spar: ValidUserOwnedSparDep
):
    """
    Get download URLs to get the media files (at the end of a SPAR/session)
    """
    return get_download_urls_controller(db=db, user=user, spar_id=spar_id, spar=spar)


@router.post("/{spar_id}/media/videos/merge", response_model=SparRead)
async def create_merged_video(
    db: DBSessionDep,
    user: NormalUserDep,
    spar: ValidUserOwnedOrAdminSparDep,
    background_tasks: BackgroundTasks,
):
    """
    Merge the videos (at the end of a SPAR/session)
    """
    if not (spar.state == SparState.finished or spar.state == SparState.failed):
        raise SparNotFinished
    if not (spar.avatar_video_id and spar.user_video_id):
        raise SparFilesNotAvailable

    if (
        spar.video_merging_state == SparVideoMergingState.started
        or spar.video_merging_state == SparVideoMergingState.in_progress
    ):
        return spar
    else:
        spar_updated = spar_video_merging_start_state_controller(
            db=db, user=user, spar=spar
        )

    background_tasks.add_task(
        create_merged_video_controller, db=db, user_id=user.id, spar_id=spar.id
    )
    return spar_updated


@router.get("/{spar_id}/media/videos/download", response_model=SparMediaMergedVideo)
def get_merged_video(
    user: NormalUserDep,
    spar: ValidUserOwnedOrAdminSparDep,
):
    """
    Get the final merged video
    """
    return get_merged_video_controller(user=user, spar=spar)
