from sqlmodel import select, desc
from sqlalchemy.orm import selectinload
from typing import List

from sqlalchemy.exc import IntegrityError
from app.core.dependencies import DBSessionDep
from app.core.exceptions import DetailedHTTPException
from app.core.logger import logger
from .exceptions import RoomNotFound, RoomAlreadyExists
from .models import (
    RoomCreate,
    Room,
    RoomUpdate,
    RoomStatus,
    RoomRead,
)


# TODO: Check if the room already exists
def create_a_room(db: DBSessionDep, room: RoomCreate):
    try:
        room_to_db = Room.model_validate(room)
        db.add(room_to_db)
        db.commit()
        db.refresh(room_to_db)
        return room_to_db
    except IntegrityError as e:
        logger.exception(e)
        db.rollback()
        raise RoomAlreadyExists()
    except Exception as e:
        logger.exception(e)
        raise DetailedHTTPException()


def read_a_room(db: DBSessionDep, room_id: int, serialized: bool = False):
    room = db.exec(
        select(Room).options(selectinload(Room.instance)).where(Room.id == room_id)
    ).first()
    if not room:
        raise RoomNotFound(original_error=str(room_id))

    if serialized:
        return RoomRead.from_orm(room, include_logs=True)
    else:
        return room  # return vars(room)


def update_room_details(
    db: DBSessionDep, room_to_update: Room, room_updates: RoomUpdate
):
    room_data = room_updates.model_dump(exclude_unset=True)
    for key, value in room_data.items():
        setattr(room_to_update, key, value)

    db.add(room_to_update)
    db.commit()
    db.refresh(room_to_update)
    return room_to_update


def read_all_rooms(
    db: DBSessionDep,
    user_id: int = None,
    room_statuses: List[str] = [RoomStatus.READY],
    serialized: bool = False,
):
    query = (
        select(Room)
        .options(selectinload(Room.instance))
        # .offset(offset)
        # .limit(limit)
        .order_by(desc(Room.created_at))
    )
    if user_id:
        query = query.filter(Room.user_id == user_id)
    if room_statuses:
        query = query.filter(
            Room.status.in_(room_statuses)
        )  # Room.status == room_status
    rooms = db.exec(query).all()

    if serialized:
        # return [vars(room) for room in rooms]  # rooms
        return [RoomRead.from_orm(room, include_logs=False) for room in rooms]
    else:
        return rooms


def delete_a_room(db: DBSessionDep, room_id: int):
    room = db.get(Room, room_id)
    if not room:
        raise RoomNotFound()
    db.delete(room)
    db.commit()
    return {"ok": True}
