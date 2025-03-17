import asyncio
from datetime import datetime
from app.core.logger import logger


background_task = None


async def manage_all_rooms():
    try:
        while True:
            logger.info(
                f"Performing cleanup and checking all rooms at {datetime.now()}"
            )
            # TODO:
            # Add the logic for checking and shutting down rooms/instances after 30 minutes of inactivity
            # You would check all rooms from the database and decide whether to shutdown instances
            # For example:
            # rooms = await get_all_rooms()
            # for room in rooms:
            #     if room.inactive_for_30_minutes():
            #         await shutdown_instance(room)
            #         await remove_room(room)

            await asyncio.sleep(120)
    except asyncio.CancelledError:
        logger.info("Background task has been cancelled")
        raise


async def start_room_lifecycle_management():
    global background_task
    if background_task is None or background_task.done():
        background_task = asyncio.create_task(manage_all_rooms())
        logger.info("Started background task for cleaning up rooms and instances")


async def stop_room_lifecycle_management():
    global background_task
    if background_task and not background_task.done():
        logger.info("Stopping background task...")
        background_task.cancel()
        try:
            await background_task
        except asyncio.CancelledError:
            logger.info(
                "Successfully stopped background task for cleaning up rooms and instances"
            )
