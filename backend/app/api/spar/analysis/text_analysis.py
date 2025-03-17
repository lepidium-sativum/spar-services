import math
from concurrent.futures import ThreadPoolExecutor
from typing import Literal, TypedDict

from app.api.spar.analysis.report_schema import Report
from app.api.spar.analysis.new_llm_calls import (
    extract_feedback,
    get_feedback_anthropic,
    get_feedback_openai,
)
from app.api.spar.modules.models import Objective, ScenarioRoles


class TimeStampedUtterance(TypedDict):
    content: str
    role: Literal["user", "assistant"]
    start_time: float
    end_time: float


def format_timestamp(timestamp: float, ceil: bool = False) -> str:
    # eg. 3.2 -> 00:03 if ceil is False, 00:04 if ceil is True
    if ceil:
        timestamp = math.ceil(round(timestamp))
    return f"{int(timestamp // 60):02d}:{int(timestamp % 60):02d}"


def format_timestamped_utterance(utterance: TimeStampedUtterance) -> str:
    return f"[{format_timestamp(utterance['start_time'])}-{format_timestamp(utterance['end_time'], ceil=True)}]"


def get_timestamped_conversation(
    conversation: list[dict[str, str]],
    user_timeline: list[dict[str, float]],
    avatar_timeline: list[dict[str, float]],
) -> list[TimeStampedUtterance]:

    user_timeline_iter = iter(user_timeline)
    avatar_timeline_iter = iter(avatar_timeline)
    timestamped_audio_conv = []
    for utterance in conversation:
        if utterance["role"] == "user":
            timestamp = next(user_timeline_iter)
        else:
            timestamp = next(avatar_timeline_iter)
        if utterance["content"] == "M.":
            # From testing I noticed that assemblyAI's transcription returns "M." when nothing was actually said.
            # It might be due to us adding more word weight to mmm um m etc. in the assembly sdk client.
            continue
        timestamped_audio_conv.append(
            TimeStampedUtterance(
                content=utterance["content"],
                start_time=timestamp["start"],
                end_time=timestamp["end"],
                role="assistant" if utterance["role"] == "assistant" else "user",
            )
        )
    return timestamped_audio_conv


def format_conversation(
    conversation: list[TimeStampedUtterance],
    roles: ScenarioRoles,
    include_timestamp: bool = False,
) -> str:
    def replace_speaker(turn: TimeStampedUtterance) -> str:
        return roles["avatar"] if turn["role"] == "assistant" else roles["user"]

    if include_timestamp:
        return "\n".join(
            [
                f"{format_timestamped_utterance(utterance)} <{replace_speaker(utterance)}> {utterance['content']}"
                for utterance in conversation
            ]
        )
    else:
        return "\n".join(
            [
                f"<{replace_speaker(utterance)}> {utterance['content']}"
                for utterance in conversation
            ]
        )


def textual_llm_metrics(
    conversation: list[dict[str, str]],
    roles: ScenarioRoles,
    roleplay_prompt: str,
    objectives: list[Objective],
    user_timeline: list[dict[str, float]] | None = None,
    avatar_timeline: list[dict[str, float]] | None = None,
) -> Report:

    has_timestamps = False
    if user_timeline and avatar_timeline:
        processed_conversation = get_timestamped_conversation(
            conversation, user_timeline, avatar_timeline
        )
        has_timestamps = True
    else:
        processed_conversation = [
            TimeStampedUtterance(
                content=utterance["content"],
                role="assistant" if utterance["role"] == "assistant" else "user",
                start_time=0,
                end_time=0,
            )
            for utterance in conversation
        ]

    formatted_conversation = format_conversation(
        processed_conversation, roles, include_timestamp=has_timestamps
    )

    objectives_str = "\n".join(
        [
            f"Objective {i+1}:\n - Title: {objective.title}\n - Description: {objective.expanded_objective}"
            for i, objective in enumerate(objectives)
        ]
    )

    with ThreadPoolExecutor() as executor:
        anthropic_future = executor.submit(
            get_feedback_anthropic,
            user_role=roles["user"],
            avatar_role=roles["avatar"],
            roleplay_prompt=roleplay_prompt,
            timestamped_tagged_conversation=formatted_conversation,
            objectives_str=objectives_str,
        )
        openai_future = executor.submit(
            get_feedback_openai,
            user_role=roles["user"],
            avatar_role=roles["avatar"],
            roleplay_prompt=roleplay_prompt,
            timestamped_tagged_conversation=formatted_conversation,
            objectives_str=objectives_str,
        )

        anthropic_feedback = anthropic_future.result()
        openai_feedback = openai_future.result()

    feedback = extract_feedback(anthropic_feedback.content, openai_feedback.content)

    metrics_sum_scores = sum(metric.score for metric in feedback.metrics)
    objectives_sum_scores = sum(objective.score for objective in feedback.objectives)
    overall_score = (metrics_sum_scores + objectives_sum_scores) / (
        len(feedback.metrics) + len(feedback.objectives)
    )

    return Report(
        **feedback.model_dump(),
        overall_score=overall_score,
    )
