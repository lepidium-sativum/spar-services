from fastapi import APIRouter

from app.api.auth.dependencies import NormalUserDep
from app.core.dependencies import DBSessionDep

from app.api.spar.rooms_manager.controller import get_all_rooms_controller
from app.api.spar.rooms_manager.room_lifecycle_manager import (
    start_room_lifecycle_management,
    stop_room_lifecycle_management,
)

router = APIRouter()


@router.get("")  # response_model=list[RoomRead]
def get_all_rooms(db: DBSessionDep, user: NormalUserDep):
    """
    Retrieve all rooms
    """
    return get_all_rooms_controller(db=db)


@router.get("/stop_cleanup")
async def stop_cleanup():
    await stop_room_lifecycle_management()
    return {"message": "Stopped room and instance cleanup."}


@router.get("/start_cleanup")
async def start_cleanup():
    await start_room_lifecycle_management()
    return {"message": "Started room and instance cleanup."}
