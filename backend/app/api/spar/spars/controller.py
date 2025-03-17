import asyncio
import json
from datetime import datetime
from pathlib import Path
from queue import Queue
from typing import AsyncGenerator

from sentry_sdk import capture_exception

from app.api.auth.dependencies import NormalUserDep

# sales_llm_client
from app.api.llms.clients.sales_llm_llama3_client import (
    generate_response,
    generate_streaming_response_with_assistant_prefill,
)

# sales_llm_prompt
from app.api.llms.prompts.sales_llm_llama3_prompt import ConversationStatus, generate_random_greeting_message, is_ended
from app.api.spar.modules.service import check_if_user_assigned_module_async, read_a_module
from app.api.spar.spars.llm_calls import get_message_emotion
from app.api.spar.spars.redis_models import SparRedis
from app.api.spar.users.service import read_a_user
from app.av_service.controller import merge_videos_controller
from app.aws.controller import (
    download_media_file_controller,
    get_media_download_signed_url_controller,
    get_media_upload_signed_url_controller,
    upload_media_file_controller,
)
from app.core.dependencies import DBSessionDep
from app.core.logger import logger
from app.external_services.azure_stt_client import get_azure_stt_token
from app.external_services.tts_client import process_queue, talk_to_tts

# from ...llms.util import append_chunk_smartly
from ...llms.exceptions import ErrorCode
from .dependencies import ValidSparDep
from .exceptions import MediaFilesNotFound, SparFailed, SparInvalidState, SparNotFound, SparSucceeded
from .models import (
    Spar,
    SparBase,
    SparCommunicate,
    SparCreate,
    SparMedia,
    SparMediaId,
    SparMediaMergedVideo,
    SparReadToken,
    SparState,
    SparUpdate,
    SparVideoMergingState,
    SparVideoStateUpdate,
)
from .service import (
    create_a_spar,
    read_a_spar,
    read_user_spars,
    update_a_spar,
    update_a_spar_video_state,
    update_media_ids_in_spar,
)

############## Helper functions #############


def get_db_objects(db: DBSessionDep, user_id: int, spar_id: int):
    user_obj = read_a_user(db=db, user_id=user_id)
    spar_obj = read_a_spar(db=db, spar_id=spar_id)
    return user_obj, spar_obj


async def initiate_conversation(spar_redis: SparRedis):
    first_message = generate_random_greeting_message(spar_redis.greeting_messages)
    conversation = [
        {"role": "system", "content": spar_redis.system_prompt},
        {"role": "assistant", "content": first_message},
    ]

    # TODO: figure out this linting error later
    response = await talk_to_tts(
        room_id=spar_redis.room_id,
        message=first_message,
        lang=spar_redis.tts.lang,
        voice=spar_redis.tts.voice,
        emotion=spar_redis.initial_emotion.value,
    )
    spar_redis.messages = conversation
    await spar_redis.save_to_redis()
    return response


def prepare_content_for_emotion_prediction(
    tagged_conversation: list[dict[str, str]],
) -> str:
    # remove the first message (system prompt) from the content
    cleaned_conversation = tagged_conversation[1:]
    content_text = "\n".join([message["content"] for message in cleaned_conversation])
    return content_text


async def orchestrate_streaming_response(
    tagged_conversation: list[dict[str, str]],
    personality_llm: dict,
    personality_tts: dict,
    wait_for_emotion: bool,
    room_id: str,
    prefilled_assistant_response: str | None = None,
):
    try:
        # Generate response for the session with prefilled assistant response
        text_stream = generate_streaming_response_with_assistant_prefill(
            conversation_history=tagged_conversation,
            llm_model_style=personality_llm["style"],
            llm_model_temperature=personality_llm["temperature"],
            prefilled_assistant_response=prefilled_assistant_response,
        )

        prepared_content_for_emotion = prepare_content_for_emotion_prediction(tagged_conversation)

        # Process the response chunks
        final_response = await process_response_chunks(
            text_stream,
            lang=personality_tts["lang"],
            voice=personality_tts["voice"],
            wait_for_emotion=wait_for_emotion,
            prepared_content_for_emotion=prepared_content_for_emotion,
            room_id=room_id,
        )
    except Exception as e:
        logger.warning(f"Error during streaming: {e}")
        capture_exception(e)
        return (ErrorCode.LLM_NOT_CONNECTED, True)

    return (final_response, False)


async def get_emotion_result(
    emotion_task: asyncio.Task[str] | None,
    conversation_text: str,
    message_text: str,
    wait_for_emotion: bool,
) -> tuple[str | None, asyncio.Task[str]]:
    """
    This function handles creating the emotion task if it doesn't exist yet, and checking if the result is ready.
    If wait_for_emotion is True, we wait for 1.5 seconds ONLY IF it's the first time we call this function.
    We know if it's the first time by checking if emotion_task is None.
    """
    if emotion_task is not None and emotion_task.done():
        return emotion_task.result(), emotion_task

    is_first_time = emotion_task is None  # used when wait_for_emotion is True
    emotion_result = None
    if emotion_task is None:
        emotion_task = asyncio.create_task(
            get_message_emotion(conversation_text=conversation_text, message_text=message_text)
        )

    if wait_for_emotion and is_first_time:
        try:
            emotion_result = await asyncio.wait_for(emotion_task, timeout=1.5)
        except asyncio.TimeoutError:
            logger.warning("Emotion prediction timed out")
            emotion_result = "neutral"

    return emotion_result, emotion_task


async def process_response_chunks(
    response_stream: AsyncGenerator[str, None],
    lang: str,
    voice: str,
    wait_for_emotion: bool,
    room_id: str,
    prepared_content_for_emotion: str,
):
    tts_queue: Queue[str] = Queue()

    final_text = ""
    accumulated_text = ""
    sentence_endings = [".", "?", "!", "\n"]
    emotion_task = None
    emotion_result = None

    try:
        async for chunk in response_stream:
            if not chunk:
                continue
            # sometimes chunk is just a space, we add it to the accumulated_text
            accumulated_text += chunk
            stripped_accumulated_text = accumulated_text.strip()
            if any(stripped_accumulated_text.endswith(p) for p in sentence_endings):
                if emotion_result is None:
                    (emotion_result, emotion_task) = await get_emotion_result(
                        emotion_task,
                        prepared_content_for_emotion,
                        accumulated_text,
                        wait_for_emotion,
                    )

                # Add to queue and process
                tts_queue.put(accumulated_text)
                await process_queue(
                    tts_queue,
                    lang=lang,
                    voice=voice,
                    emotion_result=emotion_result,
                    room_id=room_id,
                )
                final_text += accumulated_text
                accumulated_text = ""

    except Exception as e:
        logger.warning(f"Error during streaming: {e}")
        capture_exception(e)

    # Process any remaining text
    if accumulated_text.strip():
        cleaned_msg = accumulated_text.strip()
        if emotion_result is None:
            (emotion_result, emotion_task) = await get_emotion_result(
                emotion_task,
                prepared_content_for_emotion,
                cleaned_msg,
                wait_for_emotion,
            )

        tts_queue.put(cleaned_msg)
        await process_queue(
            tts_queue,
            lang=lang,
            voice=voice,
            emotion_result=emotion_result,
            room_id=room_id,
        )
        final_text += cleaned_msg

    if not emotion_result and emotion_task and not wait_for_emotion:
        # In this case, we didn't wait for the emotion prediction before, so we do it now
        try:
            emotion_result = await asyncio.wait_for(emotion_task, timeout=1)
            await talk_to_tts(emotion=emotion_result, room_id=room_id)
        except asyncio.TimeoutError:
            logger.warning("Emotion prediction timed out")

    if emotion_task:
        emotion_task.cancel()  # doesn't raise an error if task already done or cancelled

    logger.info(f"Emotion result: {emotion_result}")

    return final_text


async def orchestrate_generate_response_and_emotion(
    tagged_conversation: list[dict[str, str]],
    personality_llm: dict,
    personality_tts: dict,
    room_id: str,
    prefilled_assistant_response: str | None = None,
):
    prefilled_conversation_history = [
        *tagged_conversation,
    ]
    if prefilled_assistant_response:
        prefilled_conversation_history.append({"role": "assistant", "content": prefilled_assistant_response})

    # Get LLM response first
    reply, isError = await generate_response(
        content=prefilled_conversation_history,
        llm_model_style=personality_llm["style"],
        llm_model_temperature=personality_llm["temperature"],
        extra_body={"add_generation_prompt": False, "continue_final_message": True},
    )
    if prefilled_assistant_response:
        cleaned_reply = reply.lstrip(prefilled_assistant_response).strip()
    else:
        cleaned_reply = reply.strip()

    if isError:
        return reply, isError

    # Prepare content and predict emotion for the response
    prepared_content = prepare_content_for_emotion_prediction(tagged_conversation)

    try:
        emotion_result = await asyncio.wait_for(
            get_message_emotion(conversation_text=prepared_content, message_text=cleaned_reply),
            timeout=1,
        )
    except asyncio.TimeoutError:
        logger.warning("Emotion prediction timed out")
        emotion_result = "neutral"

    # Send to TTS with the emotion
    await talk_to_tts(
        room_id=room_id,
        message=cleaned_reply,
        lang=personality_tts["lang"],
        voice=personality_tts["voice"],
        emotion=emotion_result,
    )

    return cleaned_reply, isError


async def get_response_from_llm(spar_redis: SparRedis, stream: bool, prefilled_assistant_response: str | None = None):

    tagged_conversation = spar_redis.tag_conversation()
    personality_llm = dict(spar_redis.llm or {})
    personality_tts = dict(spar_redis.tts or {})
    wait_for_emotion = spar_redis.avatar_mode == AvatarMode.REALISM
    # Run get_response_from_llm and predict_next_emotion concurrently using asyncio
    if stream:
        (reply, isError) = await orchestrate_streaming_response(
            tagged_conversation=tagged_conversation,
            personality_llm=personality_llm,
            personality_tts=personality_tts,
            wait_for_emotion=wait_for_emotion,
            room_id=spar_redis.room_id,
            prefilled_assistant_response=prefilled_assistant_response,
        )
    else:
        (reply, isError) = await orchestrate_generate_response_and_emotion(
            tagged_conversation=tagged_conversation,
            personality_llm=personality_llm,
            personality_tts=personality_tts,
            room_id=spar_redis.room_id,
            prefilled_assistant_response=prefilled_assistant_response,
        )

    logger.info("reply")
    logger.info(reply)
    return reply, isError


#############################################


async def create_spar_controller(db: DBSessionDep, user: NormalUserDep, spar: SparCreate):
    # Check if user is assigned a specific module before being able to create a spar out of it
    await check_if_user_assigned_module_async(db=db, user_id=user.id, module_id=spar.module_id)
    # create spar in db
    module = read_a_module(db=db, module_id=spar.module_id)
    spar.total_session_duration = module.session_time
    spar.created_at = datetime.utcnow()
    spar_created = create_a_spar(db=db, user_id=user.id, spar=spar)
    # store spar details in redis for use in other controllers
    spar_redis = SparRedis.from_spar(spar_created)
    await spar_redis.save_to_redis()
    # get stt token
    stt_token = await get_azure_stt_token()
    return SparReadToken(
        token=stt_token,
        spar=spar_created,
        stt_phrase_list=module.stt_phrase_list,
        # level=module.level,
    )


def get_user_spars_controller(db: DBSessionDep, user: NormalUserDep, offset: int, limit: int):
    return read_user_spars(db=db, user_id=user.id, offset=offset, limit=limit)


def get_spar_controller(db: DBSessionDep, user: NormalUserDep, spar_id: int):  # spar: ValidSparDep
    # return spar
    return read_a_spar(db=db, spar_id=spar_id)


def spar_video_merging_start_state_controller(
    db: DBSessionDep,
    user: NormalUserDep,
    spar: ValidSparDep,
):
    spar_to_db = SparVideoStateUpdate(
        video_merging_state=SparVideoMergingState.started,
        video_merging_failure_reason=None,
    )
    spar_updated = update_a_spar_video_state(db=db, spar_to_update=spar, spar_to_db=spar_to_db)
    return spar_updated


async def update_spar_controller(db: DBSessionDep, user: NormalUserDep, spar: Spar, spar_data: SparUpdate):
    spar_to_db = SparUpdate.model_validate(spar_data)
    if (
        spar_to_db.current_session_duration is not None
        and spar_to_db.current_session_duration > spar.total_session_duration
        and spar_to_db.state not in (SparState.finished, SparState.failed)
    ):
        raise SparInvalidState
    if spar.state == SparState.finished or spar.state == SparState.failed:
        raise SparInvalidState

    if spar_to_db.state == SparState.in_progress:
        return update_a_spar(db=db, spar_to_update=spar, spar_to_db=spar_to_db)

    # TODO: handle the case where the spar is not in redis
    spar_redis = await SparRedis.from_redis(user_id=user.id, spar_id=spar.id)
    message_history = spar_redis.messages

    if spar_to_db.state == SparState.started and (not message_history):
        await initiate_conversation(spar_redis=spar_redis)
        return update_a_spar(db=db, spar_to_update=spar, spar_to_db=spar_to_db)
    if spar_to_db.state == SparState.finished or spar_to_db.state == SparState.failed:
        spar_to_db.conversation = json.dumps(message_history)
        await spar_redis.delete_from_redis()
        return update_a_spar(db=db, spar_to_update=spar, spar_to_db=spar_to_db)
    return None


async def silence_controller(user: NormalUserDep, spar: ValidSparDep):
    # if not (spar.state == SparState.started or spar.state == SparState.in_progress):
    #     raise SparInvalidState

    try:
        spar_redis = await SparRedis.from_redis(user_id=user.id, spar_id=spar.id)
    except SparNotFound:
        return

    prefilled_assistant_response = f"<{spar_redis.roles['avatar']}, nudging the {spar_redis.roles['user']} as they have not responded for a few seconds>:"
    (cleaned_msg, isError) = await get_response_from_llm(
        spar_redis,
        stream=True,
        prefilled_assistant_response=prefilled_assistant_response,
    )

    logger.debug(f"final_cleaned_msg: {cleaned_msg}")
    if not isError:
        # For later: we add the llm response but not the user message - there is none
        await spar_redis.save_llm_response(cleaned_msg)
        # TODO: Do we want to check if the avatar is  ending the conversation?
    #     is_ended_status = is_ended(cleaned_msg)
    #     if is_ended_status == ConversationStatus.SUCCESS:
    #         await asyncio.sleep(3)
    #         raise SparSucceeded
    #     elif is_ended_status == ConversationStatus.FAILED:
    #         await asyncio.sleep(3)
    #         raise SparFailed
    #     else:
    #         return True
    return not isError


async def communicate_controller(user_id: int, spar_id: int, spar_comm: SparCommunicate):

    spar_redis = await SparRedis.from_redis(user_id=user_id, spar_id=spar_id)
    if not spar_redis.messages:
        return await initiate_conversation(spar_redis=spar_redis)

    spar_redis.messages.append(
        {
            "role": "user",
            "content": spar_comm.transcription,
        }
    )
    prefilled_assistant_response = f"<{spar_redis.roles['avatar']}>:"
    (cleaned_msg, isError) = await get_response_from_llm(
        spar_redis,
        stream=True,
        prefilled_assistant_response=prefilled_assistant_response,
    )

    logger.debug(f"final_cleaned_msg: {cleaned_msg}")
    if isError:
        return False
    await spar_redis.save_llm_response(cleaned_msg)
    is_ended_status = is_ended(cleaned_msg)
    if is_ended_status == ConversationStatus.SUCCESS:
        await asyncio.sleep(3)
        raise SparSucceeded
    elif is_ended_status == ConversationStatus.FAILED:
        await asyncio.sleep(3)
        raise SparFailed
    else:
        return True


def get_upload_urls_controller(db: DBSessionDep, user: NormalUserDep, spar_id: int, spar: ValidSparDep):
    if spar.user_audio_id and spar.user_video_id and spar.avatar_audio_id and spar.avatar_video_id:
        user_audio_id = spar.user_audio_id
        user_video_id = spar.user_video_id
        avatar_audio_id = spar.avatar_audio_id
        avatar_video_id = spar.avatar_video_id
    else:
        user_audio_id = SparBase.generate_uuid()
        user_video_id = SparBase.generate_uuid()
        avatar_audio_id = SparBase.generate_uuid()
        avatar_video_id = SparBase.generate_uuid()

    user_audio_url = get_media_upload_signed_url_controller(file_key=f"{user.id}/{spar.id}/{user_audio_id}.webm")
    user_video_url = get_media_upload_signed_url_controller(file_key=f"{user.id}/{spar.id}/{user_video_id}.webm")
    avatar_audio_url = get_media_upload_signed_url_controller(file_key=f"{user.id}/{spar.id}/{avatar_audio_id}.webm")
    avatar_video_url = get_media_upload_signed_url_controller(file_key=f"{user.id}/{spar.id}/{avatar_video_id}.webm")

    # Update the URL IDs in the DB
    media_ids = SparMediaId(
        user_audio_id=user_audio_id,
        user_video_id=user_video_id,
        avatar_audio_id=avatar_audio_id,
        avatar_video_id=avatar_video_id,
    )
    # media_ids = {user_audio_id, user_video_id, avatar_audio_id, avatar_video_id}
    update_media_ids_in_spar(db=db, spar_to_update=spar, spar_to_db=media_ids)

    media_urls = SparMedia(
        user_audio_url=user_audio_url,
        user_video_url=user_video_url,
        avatar_audio_url=avatar_audio_url,
        avatar_video_url=avatar_video_url,
    )

    return media_urls


def get_download_urls_controller(db: DBSessionDep, user: NormalUserDep, spar_id: int, spar: ValidSparDep):
    if spar.user_audio_id and spar.user_video_id and spar.avatar_audio_id and spar.avatar_video_id:
        user_audio_url = get_media_download_signed_url_controller(
            file_key=f"{user.id}/{spar.id}/{spar.user_audio_id}.webm"
        )
        user_video_url = get_media_download_signed_url_controller(
            file_key=f"{user.id}/{spar.id}/{spar.user_video_id}.webm"
        )
        avatar_audio_url = get_media_download_signed_url_controller(
            file_key=f"{user.id}/{spar.id}/{spar.avatar_audio_id}.webm"
        )
        avatar_video_url = get_media_download_signed_url_controller(
            file_key=f"{user.id}/{spar.id}/{spar.avatar_video_id}.webm"
        )
        media_urls = SparMedia(
            user_audio_url=user_audio_url,
            user_video_url=user_video_url,
            avatar_audio_url=avatar_audio_url,
            avatar_video_url=avatar_video_url,
        )
        return media_urls
    else:
        raise MediaFilesNotFound


def create_merged_video_controller(db: DBSessionDep, user_id: int, spar_id: int):
    user, spar = get_db_objects(db=db, user_id=user_id, spar_id=spar_id)

    spar_to_db = SparVideoStateUpdate(video_merging_state=SparVideoMergingState.in_progress)
    update_a_spar_video_state(db=db, spar_to_update=spar, spar_to_db=spar_to_db)

    avatar_video_file_key = f"{user.id}/{spar.id}/{spar.avatar_video_id}.webm"
    avatar_video_file_path = f"/tmp/{spar.avatar_video_id}.webm"
    user_video_file_key = f"{user.id}/{spar.id}/{spar.user_video_id}.webm"
    user_video_file_path = f"/tmp/{spar.user_video_id}.webm"
    merged_video_id = SparBase.generate_uuid()
    merged_video_file_key = f"{user.id}/{spar.id}/{merged_video_id}.webm"
    merged_video_file_path = f"/tmp/{merged_video_id}.webm"

    try:
        download_media_file_controller(
            file_key=avatar_video_file_key,
            local_path=avatar_video_file_path,
        )
        download_media_file_controller(
            file_key=user_video_file_key,
            local_path=user_video_file_path,
        )

        merge_videos_controller(
            input_file1_path=avatar_video_file_path,
            input_file2_path=user_video_file_path,
            output_file_path=merged_video_file_path,
        )

        upload_media_file_controller(file_key=merged_video_file_key, local_path=merged_video_file_path)

        spar_to_db = SparVideoStateUpdate(
            merged_video_id=merged_video_id,
            video_merging_state=SparVideoMergingState.finished,
        )
        update_a_spar_video_state(db=db, spar_to_update=spar, spar_to_db=spar_to_db)
    except Exception as e:
        logger.warning(f"{e}")
        capture_exception(e)
        spar_to_db = SparVideoStateUpdate(
            video_merging_state=SparVideoMergingState.failed,
            video_merging_failure_reason=f"{e}",
        )
        update_a_spar_video_state(db=db, spar_to_update=spar, spar_to_db=spar_to_db)
    finally:
        # "missing_ok=True" to not raise an error if any one of these doesn't exist
        Path(avatar_video_file_path).unlink(missing_ok=True)
        Path(user_video_file_path).unlink(missing_ok=True)
        Path(merged_video_file_path).unlink(missing_ok=True)


def get_merged_video_controller(user: NormalUserDep, spar: ValidSparDep):
    merged_video_url = ""
    if spar.merged_video_id:
        merged_video_url = get_media_download_signed_url_controller(
            file_key=f"{user.id}/{spar.id}/{spar.merged_video_id}.webm"
        )
        logger.debug(f"merged_video_url: {merged_video_url}")
    # return merged_video_url
    return SparMediaMergedVideo(merged_video_url=merged_video_url, spar=spar)
