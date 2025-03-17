from datetime import datetime
import asyncio
from app.core.dependencies import DBSessionDep
from app.external_services.config import get_external_service_config

# from app.api.auth.dependencies import NormalUserDep
from app.api.spar.users.service import read_a_user
from app.api.spar.instances.controllers.aws import (
    get_available_ue_instance_controller,
    manage_standby_ue_instances_controller,
    create_ue_instance_controller,
    acquire_an_instance_controller,
    spin_up_ue_instance_and_app_controller,
    spin_down_ue_instance_controller,
    start_ue_application_controller,
    is_ue_instance_ready,
)

from app.api.spar.instances.controllers.azure import (
    # get_all_llm_instances_controller,
    get_llm_instance_controller,
    is_llm_instance_ready,
    start_llm_if_not_already_controller,
)
from app.api.spar.modules.service import read_a_module, check_if_user_is_assigned_module
from .models import Room, RoomCreate, RoomUpdate, RoomStatus, RoomRead
from .service import (
    create_a_room,
    read_all_rooms,
    read_a_room,
    update_room_details,
)
from .exceptions import NoMoreRoomsForUser, ResourcesNotAvailable

############## Helper functions #############


def update_room_state(
    db, room, success_state, failed_state=None, return_code=None, logs=None
):
    if success_state and failed_state:
        status = success_state if return_code == 0 else failed_state
        room_updates = RoomUpdate(
            status=status, last_edited=datetime.utcnow(), logs="\n".join(logs)
        )
    else:
        status = success_state
        room_updates = RoomUpdate(status=status, last_edited=datetime.utcnow())
    update_room_details(db=db, room_to_update=room, room_updates=room_updates)


def get_db_objects(db: DBSessionDep, user_id: int, module_id: int):
    user = read_a_user(db=db, user_id=user_id)
    module = read_a_module(db=db, module_id=module_id)
    return user, module


def get_user_and_room(db: DBSessionDep, user_id: int, room_id: int):
    user = read_a_user(db=db, user_id=user_id)
    room = read_a_room(db=db, room_id=room_id)
    return user, room


def do_prechecks_for_user(db: DBSessionDep, user_id: int):
    # Check user readiness (pre-checks), doesn't have any other active session
    user_rooms = read_all_rooms(
        db=db, user_id=user_id, room_statuses=[RoomStatus.READY, RoomStatus.IN_USE]
    )
    if user_rooms:
        raise NoMoreRoomsForUser
    # TODO: Check if an instance is already being created for this user.


# def get_ready_llm(llms):
#     for llm in llms:
#         if llm["status"] == "READY":
#             return llm


#############################################


async def create_room_controller(db: DBSessionDep, user_id: int, module_id: int):
    try:
        user, module = get_db_objects(db=db, user_id=user_id, module_id=module_id)
        do_prechecks_for_user(db=db, user_id=user_id)

        check_if_user_is_assigned_module(db=db, user_id=user_id, module_id=module_id)

        instance = get_available_ue_instance_controller(db=db)
        if instance:
            room = RoomCreate(
                name=f"user{user.id}_module{module.id}",  # instance{"instance.id"}
                metahuman=module.aiavatar.metahuman.name,
                background=module.aiavatar.bgscene.name,
                tts_server=get_external_service_config().tts_base_url,
                tts_port=get_external_service_config().tts_port,
                user_id=user.id,
                instance_id=instance.id,
            )
            return create_a_room(db=db, room=room)
        else:
            # TODO: Update Acquire call to add User_ID.
            # Then check if an instance is already being acquired against this user.
            new_instance = create_ue_instance_controller(db=db)
            asyncio.create_task(
                acquire_an_instance_controller(
                    db=db,
                    user_id=user_id,
                    instance_id=new_instance.id,
                    extra_vars={
                        "server": get_external_service_config().tts_base_url,
                        "region": new_instance.region,
                    },
                )
            )
            raise ResourcesNotAvailable
    except Exception as e:
        raise e


async def prepare_room_controller(db: DBSessionDep, user_id: int, room_id: int):
    try:
        user, room = get_user_and_room(db=db, user_id=user_id, room_id=room_id)

        # llms = get_all_llm_instances_controller(db=db)
        # llm = get_ready_llm(llms=llms)

        # TODO: If LLM is shutdown on Azure portal, our DB state doesn't remain in sync
        # Create another update API to manually update the state
        # Also implement the Azure API to get current state from Azure? Or call Ansible script to get the status?
        llm = get_llm_instance_controller(db=db)
        asyncio.create_task(
            start_llm_if_not_already_controller(db=db, user_id=user.id, llm=llm)
        )

        if room and room.instance:  # AVAILABLE (TODO for STARTED?)
            vars = {
                "aws_region": room.instance.region,
                "instance_id": room.instance.server_instance_id,
                "PixelStreamingIP": room.instance.coturn_service_alb_dns,
                "PixelStreamingPort": room.instance.pixel_streaming_port,
                "metahuman": room.metahuman,
                "background": room.background,
                "server": room.tts_server,
                "port": room.tts_port,
            }
            asyncio.create_task(
                spin_up_ue_instance_and_app_controller(
                    db=db,
                    user_id=user.id,
                    extra_vars=vars,
                    inventory=f"{room.instance.server_public_ip},",
                    instance_id=room.instance.id,
                )
            )
            update_room_state(db, room, RoomStatus.CREATING)
            asyncio.create_task(
                manage_standby_ue_instances_controller(
                    db=db,
                    user_id=user_id,
                    tts_server=get_external_service_config().tts_base_url,
                )
            )
        else:
            update_room_state(db, room, RoomStatus.FAILED)

    except Exception as e:
        raise e


def destroy_room_controller(db: DBSessionDep):
    # Check if any ROOM is IN_USE. If NO, stop_llm_instance_controller() in parallel as well
    spin_down_ue_instance_controller(extra_vars={})


# user: NormalUserDep
async def get_room_controller(db: DBSessionDep, room_id: int):
    try:
        room = read_a_room(db=db, room_id=room_id, serialized=False)
        if room and room.instance:
            ue_instance_ready = is_ue_instance_ready(
                db=db, instance_id=room.instance.id
            )
            llm_instance_ready = is_llm_instance_ready(db=db)
            if ue_instance_ready and llm_instance_ready:
                update_room_state(db, room, RoomStatus.READY)
                # TODO: FOR LATER
                #  i. (UE App ready) As soon as UE server started and connection made to TTS, TTS saves room_id/socket.id in REDIS.
                #          ROOM STATUS is set to STARTED
                #  ii. (TTS ready) When the spar-api knows the UE server is started, it should fetch SOCKET_ID from REDIS, and save in DB.
                #        Once "server started/avatar loaded", and TTS ready, room creation is complete.
                #        ROOM STATUS is set to READY
        return RoomRead.from_orm(room, include_logs=False)  # room
    except Exception as e:
        raise e


def get_all_rooms_controller(db: DBSessionDep):
    return read_all_rooms(db=db, user_id=None, room_statuses=[], serialized=True)


def get_user_ready_rooms_controller(db: DBSessionDep, user_id: int):
    return read_all_rooms(
        db=db, user_id=user_id, room_statuses=[RoomStatus.READY, RoomStatus.IN_USE]
    )


async def update_room_controller(
    db: DBSessionDep, user_id: int, module_id: int, room: Room
):
    try:
        user, module = get_db_objects(db=db, user_id=user_id, module_id=module_id)
        check_if_user_is_assigned_module(db=db, user_id=user_id, module_id=module_id)
        if room and room.instance:
            room_updates = RoomUpdate(
                metahuman=module.aiavatar.metahuman.name,
                background=module.aiavatar.bgscene.name,
                last_edited=datetime.utcnow(),
            )
            room = update_room_details(
                db=db, room_to_update=room, room_updates=room_updates
            )
            return room
    except Exception as e:
        raise e


async def refresh_room_controller(db: DBSessionDep, user_id: int, room: Room):
    try:
        llm = get_llm_instance_controller(db=db)
        asyncio.create_task(
            start_llm_if_not_already_controller(db=db, user_id=user_id, llm=llm)
        )
        vars = {
            "aws_region": room.instance.region,
            "instance_id": room.instance.server_instance_id,
            "PixelStreamingIP": room.instance.coturn_service_alb_dns,
            "PixelStreamingPort": room.instance.pixel_streaming_port,
            "metahuman": room.metahuman,
            "background": room.background,
            "server": room.tts_server,
            "port": room.tts_port,
        }
        asyncio.create_task(
            start_ue_application_controller(
                db=db,
                user_id=user_id,
                instance_id=room.instance.id,
                extra_vars=vars,
                inventory=f"{room.instance.server_public_ip},",
            )
        )
        update_room_state(db, room, RoomStatus.CREATING)
        return room  # updated_room
    except Exception as e:
        raise e
