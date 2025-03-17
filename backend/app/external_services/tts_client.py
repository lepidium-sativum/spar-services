import re
from queue import Queue
from typing import overload

import httpx
from sentry_sdk import capture_exception

from app.core.logger import logger
from app.core.util import replaceBadEscape

from ..core.exceptions import DetailedHTTPException, FailedDependency
from .config import get_external_service_config


@overload
async def talk_to_tts(
    *,
    room_id: str,
    message: str,
    lang: str,
    voice: str,
    emotion: str | None = None,
) -> dict: ...


@overload
async def talk_to_tts(
    *,
    room_id: str,
    message: None = None,
    lang: None = None,
    voice: None = None,
    emotion: str,
) -> dict: ...


async def talk_to_tts(
    *,
    room_id: str,
    message: str | None = None,
    lang: str | None = None,
    voice: str | None = None,
    emotion: str | None = None,
):
    try:
        payload = {}
        if message:
            payload = {"message": message, "lang": lang, "voice": voice}
        if emotion:
            payload["emotion"] = emotion
        if room_id:
            payload["roomId"] = room_id
        url = get_external_service_config().tts_base_url
        headers = {"Content-Type": "application/json"}
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{url}/api/public/v1/tts/speak", json=payload, headers=headers)
        if response.status_code != 200:
            logger.error(f"TTS request failed with status code: {response.status_code}")
            logger.error(f"TTS Response: {response.text}")
            raise FailedDependency
        else:
            logger.info("Data successfully sent to the external API.")

        return response.json()
    except Exception as e:
        logger.warning(e)
        capture_exception(e)
        raise DetailedHTTPException


alnum = re.compile(r"[a-zA-Z0-9]")


def contains_alnum(s: str) -> bool:
    # method to check if a string contains any alnum characters
    return alnum.search(s) is not None


async def process_queue(
    queue: Queue[str],
    lang: str,
    voice: str,
    room_id: str,
    emotion_result: str | None = None,
):
    while not queue.empty():
        tts_data = queue.get()
        # don't send string without alphanumeric characters to tts
        if contains_alnum(tts_data):
            tts_data = replaceBadEscape(tts_data).strip()
            await talk_to_tts(
                room_id=room_id,
                message=tts_data,
                lang=lang,
                voice=voice,
                emotion=emotion_result,
            )
        queue.task_done()
