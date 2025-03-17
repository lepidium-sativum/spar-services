from fastapi import APIRouter, BackgroundTasks, Request

from app.api.auth.dependencies import NormalUserDep
from app.core.dependencies import DBSessionDep
from app.core.ratelimiter import limiter

from .controller import (
    create_room_controller,
    update_room_controller,
    prepare_room_controller,
    refresh_room_controller,
    get_room_controller,
    get_user_ready_rooms_controller,
)
from .models import RoomCreate, RoomRead
from .schemas import CreateRoomPayload
# # from .dependencies import ValidUserOwnedOrAdminSparDep, ValidUserOwnedSparDep
# # from .exceptions import SparFilesNotAvailable, SparNotFinished


router = APIRouter()


@router.post("", response_model=RoomCreate)
@limiter.limit("1/minute")
async def create_room(
    request: Request,
    db: DBSessionDep,
    user: NormalUserDep,
    payload: CreateRoomPayload,
    background_tasks: BackgroundTasks,
):
    """
    Create room for a new Spar
    """
    user_ready_rooms = get_user_ready_rooms_controller(db=db, user_id=user.id)
    if len(user_ready_rooms) >= 1:
        room_to_update = user_ready_rooms[0]
        updated_room = await update_room_controller(
            db=db, user_id=user.id, module_id=payload.module_id, room=room_to_update
        )
        updated_room = await refresh_room_controller(
            db=db, user_id=user.id, room=updated_room
        )
        if len(user_ready_rooms) > 1:
            # TODO: Shut down other rooms
            print("TODO: Shutdown excess rooms")
        return RoomRead.from_orm(updated_room, include_logs=False)
    else:
        # get_room_controller(db=db, room_id=)
        room_created = await create_room_controller(
            db=db, user_id=user.id, module_id=payload.module_id
        )
        await prepare_room_controller(db=db, user_id=user.id, room_id=room_created.id)
        # background_tasks.add_task(
        #     prepare_room_controller, db=db, user_id=user.id, room_id=room_created.id
        # )
        return room_created


@router.get("/{room_id}")  # response_model=RoomRead
async def get_room_details(db: DBSessionDep, user: NormalUserDep, room_id: int):
    """
    Retrieve the details of room (including status)
    """
    return await get_room_controller(db=db, room_id=room_id)
