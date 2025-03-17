import json
from pathlib import Path
from typing import cast
import uuid

import pandas as pd
from sentry_sdk import capture_exception, capture_message

from app.api.admin.modules.objectives.models import Objective
from app.api.auth.dependencies import NormalUserDep
from app.api.spar.modules.models import ScenarioRoles, DEFAULT_ROLES
from app.api.spar.spars.dependencies import ValidSparDep
from app.api.spar.spars.exceptions import SparFilesNotAvailable, SparNotFinished
from app.api.spar.spars.models import SparMergedAudioTimeline, SparState, SparUpdate
from app.api.spar.spars.service import (
    read_a_spar,
    update_a_spar,
    update_media_timeline_in_spar,
)
from app.api.spar.users.service import read_a_user
from app.av_service.controller import merge_audios_controller
from app.aws.controller import (
    download_media_file_controller,
    upload_media_file_controller,
)
from app.aws.exceptions import S3DownloadFailed
from app.core.dependencies import DBSessionDep
from app.core.logger import logger

from ..modules.service import read_a_module, update_user_module_rating
from .audio_analysis import (
    audio_analysis_metrics,
    get_conversation_from_audio,
    get_timeline,
)
from .config import get_analysis_config
from .constants import ErrorCode
from .exceptions import AnalysisDataNotFound
from .models import Analysis, AnalysisBase, AnalysisCreate, AnalysisState, AnalysisUpdate
from .service import (
    create_a_analysis,
    read_a_analysis,
    read_a_analysis_with_spar_id,
    read_a_analysis_with_sparid,
    update_analysis,
)
from .text_analysis import textual_llm_metrics as new_textual_llm_metrics

############## Helper functions #############


def get_db_objects(db: DBSessionDep, user_id: int, spar_id: int):
    user_obj = read_a_user(db=db, user_id=user_id)
    spar_obj = read_a_spar(db=db, spar_id=spar_id)
    return user_obj, spar_obj


def spar_audio_analysis(
    df_turns: pd.DataFrame, df_words: pd.DataFrame
) -> tuple[dict | None, list[dict[str, float]], list[dict[str, float]]]:
    """
    TBD
    """
    avatar_timeline, user_timeline = get_timeline(df_turns)
    audio_analysis_res = audio_analysis_metrics(df_turns=df_turns, df_words=df_words)
    return audio_analysis_res, avatar_timeline, user_timeline


def new_spar_textual_analysis(
    audio_conversation: list[dict],
    roles: ScenarioRoles,
    system_prompt: str,
    objectives: list[Objective],
    avatar_timeline: list[dict[str, float]] | None = None,
    user_timeline: list[dict[str, float]] | None = None,
):
    if not audio_conversation:
        raise AnalysisDataNotFound
    text_analysis = new_textual_llm_metrics(
        conversation=audio_conversation,
        roles=roles,
        roleplay_prompt=system_prompt,
        objectives=objectives,
        avatar_timeline=avatar_timeline,
        user_timeline=user_timeline,
    )
    return text_analysis


def download_process_upload_merged_audio_file(
    avatar_audio_file_key: str,
    avatar_audio_file_path: str,
    user_audio_file_key: str,
    user_audio_file_path: str,
    merged_audio_file_key: str,
    merged_audio_file_path: str,
):
    try:
        # Download both audio files
        download_media_file_controller(
            file_key=avatar_audio_file_key,
            local_path=avatar_audio_file_path,
        )
        download_media_file_controller(
            file_key=user_audio_file_key,
            local_path=user_audio_file_path,
        )
        # TODO: If no Audio files, Update status to FAILED (and end this function)
        # Merge audio files to create one (background task)
        merge_audios_controller(
            input_file1_path=avatar_audio_file_path,
            input_file2_path=user_audio_file_path,
            output_file_path=merged_audio_file_path,
        )
        # Upload the new merged audio file to S3
        upload_media_file_controller(file_key=merged_audio_file_key, local_path=merged_audio_file_path)
        return True
    except S3DownloadFailed as e:
        capture_exception(e)
        return False


def do_audio_analysis(
    db: DBSessionDep,
    conversation_as_list: list[dict[str, str]],
    merged_audio_file_path: str,
    merged_audio_id: uuid.UUID,
    analysis: Analysis,
    spar: ValidSparDep,
    phrase_list: list[str] | None = None,
):
    data_for_analysis = None
    cfg = get_analysis_config()
    first_audio_model = cfg.used_audio_analysis_model
    second_model_transcription = cfg.dg if cfg.used_audio_analysis_model == cfg.aai else cfg.aai
    conversation_from_audio = get_conversation_from_audio(
        conversation_as_list=conversation_as_list,
        audio_file=merged_audio_file_path,
        model_audio_transcripts=[first_audio_model, second_model_transcription],
        phrase_list=phrase_list,
    )
    if conversation_from_audio is not None:
        # Testing before storing in the DB
        data_for_analysis = spar_audio_analysis(
            df_turns=conversation_from_audio.df_turns,
            df_words=conversation_from_audio.df_words,
        )
    else:
        capture_message(ErrorCode.ANALYSIS_GENERATION_FAILED)
    if data_for_analysis is not None:
        (audio_analysis_res, avatar_timeline, user_timeline) = data_for_analysis
        logger.debug(f"audio_analysis_res: {audio_analysis_res}")
        analysis_to_db = AnalysisUpdate(
            state=AnalysisState.in_progress,
            audio_analysis=json.dumps(audio_analysis_res),
        )
        if conversation_from_audio is not None:
            conv_json = json.dumps(conversation_from_audio.audio_conversation)
            analysis_to_db.audio_conversation = conv_json
        update_analysis(db=db, analysis_to_update=analysis, analysis_to_db=analysis_to_db)
        media_ids_timeline = SparMergedAudioTimeline(merged_audio_id=merged_audio_id)
        if not spar.avatar_audio_timeline:
            media_ids_timeline.avatar_audio_timeline = json.dumps(avatar_timeline)
        if not spar.user_audio_timeline:
            media_ids_timeline.user_audio_timeline = json.dumps(user_timeline)

        update_media_timeline_in_spar(db=db, spar_to_update=spar, spar_to_db=media_ids_timeline)
        return (conversation_from_audio, user_timeline, avatar_timeline)
    else:
        # @Abdul: your DB logic here in order to have N/A for all non textual metrics
        analysis_to_db = AnalysisUpdate(
            state=AnalysisState.in_progress,
            audio_analysis=None,
            audio_conversation=None,
        )
        update_analysis(db=db, analysis_to_update=analysis, analysis_to_db=analysis_to_db)

        media_ids_timeline = SparMergedAudioTimeline(
            avatar_audio_timeline=None,
            user_audio_timeline=None,
            merged_audio_id=merged_audio_id,
        )
        update_media_timeline_in_spar(db=db, spar_to_update=spar, spar_to_db=media_ids_timeline)
    return None


class EmptySparError(Exception): ...


def do_analysis(
    db: DBSessionDep,
    user: NormalUserDep,
    spar: ValidSparDep,
    analysis: Analysis,
):
    module = read_a_module(db=db, module_id=spar.module_id)
    scenario = cast(dict, module.scenario)
    roles: ScenarioRoles = scenario.get("roles") or DEFAULT_ROLES

    analysis_to_db = AnalysisUpdate(state=AnalysisState.in_progress)
    update_analysis(db=db, analysis_to_update=analysis, analysis_to_db=analysis_to_db)

    avatar_audio_file_key = f"{user.id}/{spar.id}/{spar.avatar_audio_id}.webm"
    avatar_audio_file_path = f"/tmp/{user.id}_{spar.id}_{spar.avatar_audio_id}.webm"
    user_audio_file_key = f"{user.id}/{spar.id}/{spar.user_audio_id}.webm"
    user_audio_file_path = f"/tmp/{user.id}_{spar.id}_{spar.user_audio_id}.webm"

    # TODO: Check if merged_audio_id already exists. If yes, try to download the audio.
    # If not, then create new one
    # Move this code under try/except then
    merged_audio_id = AnalysisBase.generate_uuid()
    merged_audio_file_key = f"{user.id}/{spar.id}/{merged_audio_id}.webm"
    merged_audio_file_path = f"/tmp/{user.id}_{spar.id}_{merged_audio_id}.webm"
    try:
        if not spar.conversation:
            raise AnalysisDataNotFound

        conversation = spar.conversation
        conversation_as_list: list[dict[str, str]] = json.loads(conversation)
        system_prompt = conversation_as_list.pop(0)  # Remove the system prompt
        if len(conversation_as_list) < 2:
            # Don't proceed with the analysis if the user didn't speak
            raise EmptySparError("Spar is empty")
        merge_success = download_process_upload_merged_audio_file(
            avatar_audio_file_key,
            avatar_audio_file_path,
            user_audio_file_key,
            user_audio_file_path,
            merged_audio_file_key,
            merged_audio_file_path,
        )
        conversation_from_audio = None
        user_timeline = None
        avatar_timeline = None
        if merge_success:
            audio_analysis_result = do_audio_analysis(
                db=db,
                conversation_as_list=conversation_as_list,
                merged_audio_file_path=merged_audio_file_path,
                merged_audio_id=merged_audio_id,
                analysis=analysis,
                spar=spar,
                phrase_list=module.stt_phrase_list,
            )
            if audio_analysis_result is not None:
                (
                    conversation_from_audio,
                    user_timeline,
                    avatar_timeline,
                ) = audio_analysis_result
            else:
                # update db with invalid
                pass
            # IMPORTANT: FAILED TWICE TO IDENTIFY SPEAKERS; FOR NOW WE WILL SIMPLY RETURN THE TEXTUAL LLM ANALYSIS

            #     # Failed again with the second model - using the forced conversion
            #     audio_conversation, transcript, df_turns, df_words = get_df_manually_from_smth_else()
            #     data_for_analysis = spar_audio_analysis(
            #         spar=spar,
            #         df_turns=df_turns,
            #         df_words=df_words,
            #     )

        # TEXT ANALYSIS WILL ALWAYS WORK:
        # - either with the original pre-rcorded transcipt or from guess speaker with speakers identified
        if conversation_from_audio is not None:
            audio_conversation = conversation_from_audio.audio_conversation
        else:
            audio_conversation = conversation_as_list

        report = new_spar_textual_analysis(
            audio_conversation=audio_conversation,
            roles=roles,
            system_prompt=system_prompt["content"],
            objectives=module.objectives,
            avatar_timeline=avatar_timeline,
            user_timeline=user_timeline,
        )
        # overall score is between 0 and 10, while rating is between 0 and 100
        rating = round(report.overall_score * 10)
        text_analysis_res = report.model_dump()

        logger.debug(f"text_analysis_res: {text_analysis_res}")
        analysis_to_db = AnalysisUpdate(
            state=AnalysisState.finished,
            text_analysis=(json.dumps(text_analysis_res) if text_analysis_res is not None else None),
        )
        update_analysis(db=db, analysis_to_update=analysis, analysis_to_db=analysis_to_db)

        update_a_spar(db=db, spar_to_update=spar, spar_to_db=SparUpdate(rating=rating))

        # Update UserModuleLink average rating
        update_user_module_rating(db=db, user_id=user.id, module_id=module.id)

    except EmptySparError as e:
        capture_message(str(e), level="warning")
        analysis_to_db = AnalysisUpdate(state=AnalysisState.failed, failure_reason=f"{e}")
        update_analysis(db=db, analysis_to_update=analysis, analysis_to_db=analysis_to_db)
    except Exception as e:
        logger.error(ErrorCode.ANALYSIS_GENERATION_FAILED)
        capture_exception(e)
        analysis_to_db = AnalysisUpdate(state=AnalysisState.failed, failure_reason=f"{e}")
        update_analysis(db=db, analysis_to_update=analysis, analysis_to_db=analysis_to_db)
        # raise AnalysisGenerationFailed
    finally:
        # "missing_ok=True" to not raise an error if any one of these doesn't exist
        Path(avatar_audio_file_path).unlink(missing_ok=True)
        Path(user_audio_file_path).unlink(missing_ok=True)
        Path(merged_audio_file_path).unlink(missing_ok=True)


#############################################


def read_analysis_controller(
    db: DBSessionDep,
    user: NormalUserDep,
    spar: ValidSparDep,
    analysis: AnalysisCreate,
):
    analysis_found = read_a_analysis_with_spar_id(db=db, spar_id=spar.id)
    return analysis_found


def analysis_start_state_controller(
    db: DBSessionDep,
    user: NormalUserDep,
    spar: ValidSparDep,
    analysis: Analysis,
):
    analysis_to_db = AnalysisUpdate(state=AnalysisState.started, failure_reason=None)
    analysis_updated = update_analysis(db=db, analysis_to_update=analysis, analysis_to_db=analysis_to_db)
    return analysis_updated


def create_analysis_controller(
    db: DBSessionDep,
    user: NormalUserDep,
    spar: ValidSparDep,
    analysis: AnalysisCreate,
):
    if not (spar.state == SparState.finished or spar.state == SparState.failed):
        raise SparNotFinished
    if not (spar.avatar_audio_id and spar.user_audio_id):
        raise SparFilesNotAvailable

    analysis.spar_id = spar.id
    analysis_created = create_a_analysis(db=db, analysis=analysis)
    return analysis_created


def start_analysis_controller(db: DBSessionDep, user_id: int, spar_id: int, analysis_id: int):
    user, spar = get_db_objects(db=db, user_id=user_id, spar_id=spar_id)
    analysis = read_a_analysis(db=db, analysis_id=analysis_id)
    do_analysis(db=db, user=user, spar=spar, analysis=analysis)


def get_analysis_controller(db: DBSessionDep, user: NormalUserDep, analysis_id: int):
    # TODO: Check if the user has access to this analysis
    analysis = read_a_analysis(db=db, analysis_id=analysis_id)
    return analysis


def get_analysis_with_spar_id_controller(db: DBSessionDep, user: NormalUserDep, spar_id: int):
    # TODO: Check if the user has access to this analysis
    analysis = read_a_analysis_with_sparid(db=db, spar_id=spar_id)
    return analysis
