import re
from dataclasses import dataclass
from typing import Literal, NewType, Optional, Sequence, Tuple, cast, overload

import assemblyai.types as aai_types
import deepgram.clients.listen.v1.rest.response as dg_types
import numpy as np
import pandas as pd
from sentry_sdk import capture_exception, capture_message

from app.api.llms.clients.oai_client import embed_text
from app.api.spar.analysis.llm_calls import gpt_speaker_guesser
from app.core.logger import logger
from app.core.util import classify_wpm, count_words_in_list
from app.external_services.assemblyAI_client import aai_sdk_transcribe_audio_file
from app.external_services.deepgram_client import transcribe_audio_file_with_options

from .config import get_analysis_config


@dataclass
class DGWord(dg_types.ListenRESTWord):
    # Deepgram word class - base class doesn't have channel field
    channel: str = "0"


def audio_analysis_metrics(df_turns: pd.DataFrame, df_words: pd.DataFrame) -> dict | None:
    """
    Perform audio analysis from assemblyAI or deepgram and return results as a JSON structure.

    Args:
        df_turns (pd.DataFrame): turn-level table (one row per speaker turn) from pre-recorded transcription
        df_words (pd.DataFrame): word-level table (one row per speaker's word) from pre-recorded transcription

    Returns:
        Dict: JSON structure containing the analysis results. It  has the following items

        - `total_speaking_time` (dict): Computes the total speaking time for each speaker in the transcript based on word duration
            used for the percentage of speaking time ?
        - `speech_rate` (dict): Computes the speech rate for each speaker in the transcript as the nb words divided by the speaking time (total_speaking_time)
            used for the number of words per minute (WPM wdiget)
        - `average_turn_duration` (dict): Computes the average speaking turn duration for each speaker in the transcript.
        - `average_silence_duration` (dict): Computes the average silence duration accumulated within a speaker turn for each speaker in the transcript
        - `average_answering_time` (dict): Computes the word average silence duration for each speaker in the transcript.
        - `language_complexity` (dict): Measures the language complexity for each speaker in the transcript. Number of unique words for now
            used for the number of unique words wdiget
        - `filler_words` (dict): computes the number of filler words by speaker
            used for the number of filler words wdiget

        - `pace` (dict): Classifies speech_rate according to the following:

            Less than 110 wpm or over than 180 wpm - Bad (red)
            110-120 wpm or 160-180- Ok (yellow)
            120-160 wpm -  Good (green) - bar is full at 150

        - `average_sentence_length` (dict): Returns the average number of words per sentence in user turns only

    """
    try:
        average_sentence_length = calculate_average_sentence_length(df_turns)

        # Compute table metrics
        table_metrics = get_table_metrics(df_words, df_turns)
        if not table_metrics:
            logger.warning("Failed to get the table metrics")
            capture_message("Failed to get the table metrics")
            return None

        (df_speakers, res_speaking_time, res_silence_time) = table_metrics

        total_speaking_time = (
            df_speakers.set_index("speaker").total_speaking_time_between_words
            / sum(df_speakers.total_speaking_time_between_words)
            * 100
        )
        speech_rate = df_speakers.set_index("speaker")["speech_rate_between_words"] * 60  # from seconds to minutes

        average_turn_duration = res_speaking_time.set_index("speaker")["avg_speaking_time_per_turn"]
        average_silence_duration = res_silence_time.set_index("speaker")["avg_silence_time_per_turn"]
        average_answering_time = df_speakers.set_index("speaker")["avg_answering_time"]

        pace = df_speakers.set_index("speaker")["speech_rate_between_words"].apply(lambda x: classify_wpm(60 * x))

        language_complexity = count_words_in_list(df_words).groupby("speaker")["speaker"].count()
        filler_words = (
            count_words_in_list(df_words, words_list=get_analysis_config().filler_words)
            .groupby("speaker")["count"]
            .sum()
        )

        json_results = {
            "total_speaking_time": total_speaking_time.to_dict(),
            "speech_rate": speech_rate.to_dict(),
            "average_turn_duration": average_turn_duration.to_dict(),
            "average_silence_duration": average_silence_duration.to_dict(),
            "average_answering_time": average_answering_time.to_dict(),
            "language_complexity": language_complexity.to_dict(),
            "filler_words": filler_words.to_dict(),
            "pace": pace.to_dict(),
            "average_sentence_length": average_sentence_length,
        }

        return json_results
    except Exception as e:
        logger.warning(f"Issue {e} for function audio_analysis_metrics - input {df_turns.head(1)} * {df_words.head(1)}")
        capture_exception(e)
        return None


def get_table_metrics(
    df_words: pd.DataFrame, df_turns: pd.DataFrame
) -> Optional[Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]]:
    """
    Calculate table metrics from word-level and turn-level DataFrames.

    Args:
        df_words (pd.DataFrame): DataFrame containing word-level data.
        df_turns (pd.DataFrame): DataFrame containing turn-level data.

    Returns:
        Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]: Tuple containing four DataFrames:
            - First DataFrame contains speaker-level metrics derived from both word-level and turn-level data.
            - Second DataFrame contains speaker turn-level data.
            - Third DataFrame contains aggregated speaking time for each speaker.
            - Fourth DataFrame contains aggregated silence time for each speaker.
    """
    try:
        # get speaker turns
        turn_metrics = turn_level_metrics(df_turns)
        if not turn_metrics:
            logger.info("Failed to get the turn metrics")
            return
        df, df_speakers_turns = turn_metrics

        # get speaker words
        word_metrics = word_level_metrics(df_words)
        if not word_metrics:
            logger.info("Failed to get the word metrics")
            return
        df, df_speakers_words = word_metrics

        df_speakers = df_speakers_turns.join(
            df_speakers_words, on="speaker", how="left", rsuffix="_between_words"
        ).reset_index()
        df_speakers.columns
        # df_speakers contains word- and turn-level informations
        df_speakers = df_speakers[
            [
                "speaker",
                "total_answering_time",
                "avg_answering_time",
                "total_words",
                "avg_turn_words",
                "avg_turn_speaking_time",
                "total_speaking_time",
                "speech_rate",
                "total_silence_time",
                "total_words_between_words",
                "total_speaking_time_between_words",
                "speech_rate_between_words",
            ]
        ]

        # speaker level from turn
        speak_time_tuple = get_speaking_time_with_gaps(df_words)
        if not speak_time_tuple:
            logger.warning("Failed to get the get_speaking_time_with_gaps")
            capture_message("Failed to get the get_speaking_time_with_gaps")
            return
        speaker_turns, res_speaking_time, res_silence_time = speak_time_tuple
        # speaker_turns, res_speaking_time, res_silence_time = get_speaking_time_with_gaps(df_words)
        return df_speakers, res_speaking_time, res_silence_time
    except Exception as e:
        logger.warning(f"Issue {e} for function get_table_metrics - input {df_words.head(1)} * {df_turns.head(1)}")
        capture_exception(e)
        return None


def get_speaking_time_with_gaps(
    words: pd.DataFrame,
) -> Optional[Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]]:
    """
    Calculate speaking time and silence time (defined as time gap between 2 consecutive words no matter te speaker) for each speaker at the word-level along with their turn-level aggregation (sum & mean)
    It iterates through each word entry in the transcript and accumulates speaking time and silence time while keeping track of word duration sum and time gap between consecutive words.

    Additionally, the function includes commented-out code to print individual speaker information and total speaking time for each speaker.

    Args:
        words (pd.DataFrame): DataFrame containing word-level data.

    Returns:
        Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]: Tuple containing three DataFrames:
            - First DataFrame contains speaker turn-level data.
            - Second DataFrame contains aggregated speaking time for each speaker (sum & mean)
            - Third DataFrame contains aggregated silence time for each speaker (sum & mean)
    """
    try:
        # words=df_words.copy()
        # store total speaking time and number of words by speaker
        total_speaking_time = {}
        # store total silence time by speaker
        total_silence_time = {}
        # [0] gets the total time
        # [1] gets the total amount of items (words or silences)
        res_speaking_time = {}
        res_silence_time = {}
        speaker_turns = []
        current_speaker = -1
        # for row in words.itertuples(index=True):
        # print(row)
        # row.Index

        # Iterate through each word entry in the transcript.
        for word in words.itertuples(index=True):
            # word.Index to access index
            # Extract the speaker number for the current word.
            speaker_number = word.speaker
            # Check if the speaker has changed
            if speaker_number is not current_speaker:
                current_speaker = speaker_number

                # Add a new entry for the speaker in the speaker_turns list.
                # 0 is the total amount of time per turn for each speaker
                # speaker_turns accumulate over one speaker turn the following :
                # - speaker_number: speaker_id
                # - list of words in the turn
                # - speaking time
                # - silence time
                #
                #
                speaker_turns.append([speaker_number, [], 0, 0])

                # Try to update the total_speaking_time dictionary.
                try:
                    # update word count
                    total_speaking_time[speaker_number][1] += 1
                    # update silence count
                    total_silence_time[speaker_number][1] += 1
                except KeyError:
                    total_speaking_time[speaker_number] = [0, 1]
                    total_silence_time[speaker_number] = [0, 1]

            # Get the word for the current entry.
            get_word = word.word

            # Append the word to the current speaker's words list.
            speaker_turns[-1][1].append(get_word)

            # Update the total speaking time for the current speaker.
            # [0] gets the total time
            word_duration = word.end - word.start
            total_speaking_time[speaker_number][0] += word_duration
            speaker_turns[-1][2] += word_duration

            # Calculate and update the gap for the current word

            word_gap = (word.start - words.loc[word.Index - 1, "end"]) if word.Index > 0 else 0
            total_silence_time[speaker_number][0] += word_gap
            speaker_turns[-1][3] += word_gap

        # Print individual speaker information.
        """
        for speaker, words, speaking_time, silence_time in speaker_turns:
            print(f"Speaker {speaker}: {' '.join(words)}")
            print(f"Speaker {speaker}: {speaking_time}")
            print(f"Speaker {speaker}: {silence_time}")
        """
        speaker_turns = pd.DataFrame(speaker_turns)
        speaker_turns.columns = ["speaker", "words", "speaking_time", "silence_time"]
        speaker_turns.groupby("speaker").speaking_time.mean().to_dict()
        speaker_turns.groupby("speaker").silence_time.mean().to_dict()
        speaker_turns.groupby("speaker").agg({"speaking_time": "mean", "silence_time": "mean"}).reset_index()

        speaker_turns.groupby("speaker").silence_time.sum()

        # Print total speaking time for each speaker.
        for speaker, (total_time, word_count) in total_speaking_time.items():
            # print(f"Speaker {speaker} avg time per turn: {total_time/word_count} ")
            # print(f"Total time of conversation: {total_time}")
            res_speaking_time[speaker] = {
                "speaker": str(speaker),
                "total_speaking_time": total_time,
                "avg_speaking_time_per_turn": total_time / word_count,
            }

        # Print total silence time (between 2 consecutive words) for each speaker. So there are as many silence periods as the word count
        for speaker, (total_time, word_count) in total_silence_time.items():
            # print(f"Speaker {speaker} avg silence time per turn: {total_time/word_count} ")
            # print(f"Total silence time of conversation: {total_time}")
            res_silence_time[speaker] = {
                "speaker": str(speaker),
                "total_silence_time": total_time,
                "avg_silence_time_per_turn": total_time / word_count,
            }

        res_speaking_time = pd.DataFrame(res_speaking_time).T
        res_silence_time = pd.DataFrame(res_silence_time).T

        return speaker_turns, res_speaking_time, res_silence_time
    except Exception as e:
        logger.error(f"Issue {e} for function get_speaking_time_with_gaps - input {words.head(1)}")
        return None


def turn_level_metrics(df: pd.DataFrame) -> Optional[Tuple[pd.DataFrame, pd.DataFrame]]:
    """
    Calculate turn-level metrics from a DataFrame containing turn-level conersation data.

    Args:
        df (pd.DataFrame): DataFrame containing turn-level data.

    Returns:
        Tuple[pd.DataFrame, pd.DataFrame]: Tuple containing two DataFrames:
            - First DataFrame contains turn-level metrics such as text, speaker, duration, and time gap.
            - Second DataFrame contains speaker-level metrics aggregated from the turn-level data.
    """
    try:
        # df=df_turns.copy()

        # Compute the duration of each word
        df["duration"] = df["end"] - df["start"]

        # Calculate the time gap between consecutive words (representing silence)
        df["time_gap"] = df["start"] - df["end"].shift(fill_value=0)
        df.loc[0, "time_gap"] = 0
        # print(df[['text', 'speaker', 'duration', 'time_gap']])

        # Group metrics by speaker:
        # - answering time stands for the time between 2 turns (speaker changing)
        df_speakers = df.groupby(["speaker"]).agg(
            total_answering_time=pd.NamedAgg(column="time_gap", aggfunc="sum"),
            avg_answering_time=pd.NamedAgg(column="time_gap", aggfunc="mean"),
            total_words=pd.NamedAgg(column="num_words", aggfunc="sum"),
            avg_turn_words=pd.NamedAgg(column="num_words", aggfunc="mean"),
            avg_turn_speaking_time=pd.NamedAgg(column="duration", aggfunc="mean"),
            total_speaking_time=pd.NamedAgg(column="duration", aggfunc="sum"),
        )
        df_speakers["speech_rate"] = df_speakers.total_words / df_speakers.total_speaking_time
        return df[["text", "speaker", "duration", "time_gap"]], df_speakers
    except Exception as e:
        logger.error(f"Issue {e} for function turn_level_metrics - input {df.head(1)}")
        return None


def word_level_metrics(df: pd.DataFrame) -> Optional[Tuple[pd.DataFrame, pd.DataFrame]]:
    """
    Calculate word-level metrics from a DataFrame containing word-level conversation data.

    Args:
        df (pd.DataFrame): DataFrame containing word-level data.

    Returns:
        Tuple[pd.DataFrame, pd.DataFrame]: Tuple containing two DataFrames:
            - First DataFrame contains word-level metrics such as word, speaker, duration, and time gap.
            - Second DataFrame contains speaker-level metrics aggregated from the word-level data.
    """
    try:
        # df=df_words.copy()

        # Compute the duration of each word
        df["duration"] = df["end"] - df["start"]

        # Calculate the time gap between consecutive words (representing silence)
        df["time_gap"] = df["start"] - df["end"].shift(fill_value=0)
        df.loc[0, "time_gap"] = 0
        # print(df[['word', 'speaker', 'duration', 'time_gap']])

        # silence between consecutive words
        df_speakers = df.groupby(["speaker"]).agg(
            total_silence_time=pd.NamedAgg(column="time_gap", aggfunc="sum"),
            # avg_word_silence_time=pd.NamedAgg(column='time_gap', aggfunc='mean'),
            total_words=pd.NamedAgg(column="start", aggfunc="count"),
            # avg_word_speaking_time=pd.NamedAgg(column='duration', aggfunc='mean'),
            total_speaking_time=pd.NamedAgg(column="duration", aggfunc="sum"),
        )
        df_speakers["speech_rate"] = df_speakers.total_words / df_speakers.total_speaking_time

        return df[["word", "speaker", "duration", "time_gap"]], df_speakers
    except Exception as e:
        logger.error(f"Issue {e} for function word_level_metrics - input {df.head(1)}")
        return None


def calculate_average_sentence_length(df_turns: pd.DataFrame) -> dict:
    """
    Calculate the average number of words per sentence in user turns.

    Args:
        df_turns (pd.DataFrame): DataFrame containing turn-level data.

    Returns:
        dict: A dictionary where keys are speakers and values are the average sentence lengths.
              Returns an empty dictionary if an issue occurs.

    Notes:
        This function calculates the average number of words per sentence in user turns
        based on the provided DataFrame. It splits sentences on punctuation marks and
        retains only sentences with more than two words.
    """

    res = {}
    try:
        for speaker in df_turns.speaker.unique():
            user_turns = list(df_turns.loc[df_turns.speaker == speaker, "text"])
            all_sentences = " ".join(user_turns)
            sentences = re.split(r"[.!?]+", all_sentences)  # Split on punctuation with regex
            sentences = [
                sentence.strip() for sentence in sentences if len(sentence.split()) > 2
            ]  # keep only sentences with more than 2 words
            if not sentences:
                average = 0
            else:
                average = round(sum(len(sentence.split()) for sentence in sentences) / len(sentences))
            res[speaker] = average
        return res
    except Exception as e:
        logger.error(f"Issue in calculate_average_sentence_length. Exception: {e} * Input data: {df_turns}")
        return {}


@dataclass
class ConversationFromAudio:
    df_turns: pd.DataFrame
    df_words: pd.DataFrame
    audio_conversation: list[dict]


def get_conversation_from_audio(
    conversation_as_list: list[dict[str, str]],
    audio_file: str,
    model_audio_transcripts: list[Literal["aai", "dg"]] = [get_analysis_config().used_audio_analysis_model],
    phrase_list: list[str] | None = None,
) -> ConversationFromAudio | None:
    """
    Gets the conversation from the audio file using the specified models for transcription.
    Also guesses speakers using original conversation from the db.
    """
    for model_audio_transcript in model_audio_transcripts:
        paragraphs, words = get_transcription(
            audio_file=audio_file,
            api_model=model_audio_transcript,
            phrase_list=phrase_list,
        )

        df_words = get_words(words, model_audio_transcript)
        df_turns = get_turns(paragraphs, model_audio_transcript)
        if len(df_turns.speaker.unique()) < 2:
            raise ValueError("Less than 2 speakers found in the audio recording")

        speakers_map = guess_speakers(conversation_as_list, df_turns)
        if not speakers_map:
            # Guard clause
            capture_message(
                f"Failed {model_audio_transcript} - to be logged to see why + count and if too often stop using {model_audio_transcript}"
            )
            continue
        df_turns.replace({"speaker": speakers_map}, inplace=True)
        df_words.replace({"speaker": speakers_map}, inplace=True)
        audio_conversation = get_conversation_as_list(df_turns)
        return ConversationFromAudio(
            df_turns=df_turns,
            df_words=df_words,
            audio_conversation=audio_conversation,
        )
    return None


def clamp_aai_utterance_words(utterance: aai_types.Utterance) -> aai_types.Utterance:
    """Sometimes AssemblyAI thinks words are more than 3 seconds long. Clamp them to 3 seconds."""
    for word in utterance.words:
        if word.end - word.start > 3000:
            word.end = word.start + 3000
    return utterance


def split_aai_utterance(utterance: aai_types.Utterance) -> list[aai_types.Utterance]:
    """Split an utterance into multiple utterances if the pause between words is too long."""
    utterances = []
    current_words: list[aai_types.UtteranceWord] = []
    previous_word_end = utterance.start

    def flush():
        utterances.append(
            aai_types.Utterance(
                text=" ".join(w.text for w in current_words),
                start=current_words[0].start,
                end=current_words[-1].end,
                confidence=utterance.confidence,  # leave as is
                speaker=utterance.speaker,
                channel=utterance.channel,
                words=current_words,
            )
        )

    for word in utterance.words:
        if word.start - previous_word_end > 1000:
            flush()
            current_words = []
        current_words.append(word)
        previous_word_end = word.end

    if current_words:
        flush()
    return utterances


@overload
def get_transcription(
    audio_file: str, api_model: Literal["aai"], phrase_list: list[str] | None = None
) -> tuple[list[aai_types.Utterance], list[aai_types.UtteranceWord]]: ...


@overload
def get_transcription(
    audio_file: str, api_model: Literal["dg"], phrase_list: list[str] | None = None
) -> tuple[list[dg_types.Utterance], list[DGWord]]: ...


def get_transcription(
    audio_file: str, api_model: str, phrase_list: list[str] | None = None
) -> tuple[list[aai_types.Utterance], list[aai_types.UtteranceWord]] | tuple[list[dg_types.Utterance], list[DGWord]]:
    """
    Function to retrieve transcription from an audio file using either Deepgram or AssemblyAI.

    Args:
        audio_file (str, optional): Path to the audio file. Defaults to "./analysis/audio.webm".
        api_model (str, optional): API model to use for transcription. Possible values are 'dg' for Deepgram and 'aai' for AssemblyAI.
            Defaults to 'dg'.

    Returns:
        Tuple containing:
            - paragraphs (List[Dict[str, Any]]): List of dictionaries containing speaker turns with time stamps and a 'num_words' column with the number of words in one turn
            - words (List[Dict[str, Any]]): List of dictionaries containing speaker words
    """
    try:
        words_to_boost = get_analysis_config().filler_words
        if phrase_list:
            words_to_boost.extend(phrase_list)
        if api_model == get_analysis_config().aai:
            response = aai_sdk_transcribe_audio_file(file_url=audio_file, words_to_boost=words_to_boost)
            if not response or not response.utterances:
                logger.error("Failed to get the transcript - stopping here")
                return [], []
            corrected_utterances = [clamp_aai_utterance_words(p) for p in response.utterances]
            paragraphs = [split for utterance in corrected_utterances for split in split_aai_utterance(utterance)]
            aai_words = sorted(
                [w for utterance in paragraphs for w in utterance.words],
                key=lambda x: x.start,
            )

            return paragraphs, aai_words

        elif api_model == get_analysis_config().dg:
            response = transcribe_audio_file_with_options(file_path=audio_file, words_to_boost=words_to_boost)
            if not response or not response.results or not response.results.utterances:
                logger.error("Failed to get the transcript - stopping here")
                return [], []
            paragraphs = response.results.utterances
            dg_words: list[DGWord] = []
            for utterance in paragraphs:
                for word in utterance.words:
                    w = DGWord(**word.to_dict(), channel=str(utterance.channel))
                    dg_words.append(w)

            return paragraphs, dg_words
        else:
            raise ValueError("Invalid API model. Please use 'dg' for Deepgram or 'aai' for AssemblyAI.")
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return [], []


def get_words(
    words: Sequence[aai_types.UtteranceWord] | Sequence[DGWord],
    api_model: Literal["aai", "dg"],
) -> pd.DataFrame:
    """
    Get speaker words table (one row per spoken word) from API transcription response

    Args:
        words (Dict): Transcription data containing word-level information.
        api_model (str, optional): API model used for transcription. Defaults to 'dg'.

    Returns:
        pd.DataFrame: DataFrame containing speaker words with columns for speaker, word text, start and end times.
    """
    try:
        if api_model == get_analysis_config().aai:
            words = cast(list[aai_types.UtteranceWord], words)
            # Convert response to DataFrame
            df_words = pd.DataFrame(words)
            # retrieve column names from dict key
            df_words.columns = [keys for keys in dict(words[0]).keys()]
            # get second coordinate from tupple
            df_words = df_words.map(lambda x: x[1])
            # Extract necessary columns
            df_words = df_words[["speaker", "text", "start", "end"]]
            # Convert timestamps to seconds
            df_words["start"] = df_words["start"] / 1000
            df_words["end"] = df_words["end"] / 1000
            # Split on punctuation with regex to keep nothing but letters, digits, underscores (all in \w), hyphens (-), and "\'"
            df_words["word"] = df_words["text"].apply(lambda x: re.sub(r"[^\w\-\']", "", x.lower()))

        elif api_model == get_analysis_config().dg:
            words = cast(list[DGWord], words)
            # Convert response to DataFrame
            df_words = pd.DataFrame(words)
            # Speaker label as string
            df_words["speaker"] = df_words["channel"]

        df_words["speaker"] = df_words["speaker"].apply(str)

        return df_words
    except Exception as e:
        logger.error(f"Issue {e} for function get_words - api model = {api_model}")
        raise e


def compress_dg_turns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compresses the turns dataframe by concatenating the text for each speaker.
    Example:
    Input:
    speaker  text
    0      A  Hello
    1      A  how are you
    2      B  I am fine
    3      B  thank you

    Output:
    speaker  text
    0      A  Hello how are you
    1      B  I am fine thank you
    """

    compressed = (
        df.groupby((df["speaker"] != df["speaker"].shift()).cumsum())
        .agg(
            {
                "speaker": "first",
                "text": " ".join,
                "start": "first",
                "end": "last",
                "words": lambda x: [word for turn_words in x for word in turn_words],
            }
        )
        .reset_index(drop=True)
    )
    compressed["num_words"] = compressed["words"].apply(lambda x: len(x))

    return compressed


def compress_aai_turns(df: pd.DataFrame) -> pd.DataFrame:
    speakers = df.speaker.unique()
    df_1 = df[df.speaker == speakers[0]]
    df_2 = df[df.speaker == speakers[1]]

    compression_dict = {
        "text": " ".join,
        "start": "first",
        "end": "last",
        "confidence": "mean",
        "speaker": "first",
        "channel": "first",
        "words": lambda x: [word for turn_words in x for word in turn_words],
    }

    def compress_interruptions(df: pd.DataFrame) -> pd.DataFrame:
        """Calculates the pause length between consecutive utterances and merges them if it's less than 100ms"""
        df["previous_end"] = df["end"].shift(1)
        df["pause_length"] = df["start"] - df["previous_end"]
        merge_mask = df["pause_length"] < 100  # 100ms
        # Create a group identifier
        df["group"] = (~merge_mask).cumsum()

        # Aggregate the data within each group
        df_compressed = df.groupby("group").agg(compression_dict).reset_index(drop=True)

        return df_compressed

    df_1 = compress_interruptions(df_1)
    df_2 = compress_interruptions(df_2)

    # Merge the two dfs and sort by start and drop index
    merged_df = pd.concat([df_1, df_2]).sort_values(by="start").reset_index(drop=True)

    return merged_df


def get_turns(
    paragraphs: Sequence[aai_types.Utterance] | Sequence[dg_types.Utterance],
    api_model: Literal["aai", "dg"],
) -> pd.DataFrame:
    """
    Get speaker turns table (one row per speaker turn) from API transcription response.

    Args:
        paragraphs (Dict): Transcription data containing paragraph-level information.
        api_model (str, optional): API model used for transcription. Defaults to 'dg'.

    Returns:
        pd.DataFrame: DataFrame containing speaker turns with columns for speaker, turn text, start and end times.
    """
    try:
        if api_model == get_analysis_config().aai:
            # Convert response to DataFrame
            df_turns = pd.DataFrame(paragraphs)
            # retrieve column names from dict key
            df_turns.columns = list(dict(paragraphs[0]).keys())
            # get second coordinate from tupple
            df_turns = df_turns.map(lambda x: x[1])
            # compress turns if pause is less than 100ms and if two or more utterances are from the same speaker
            df_turns = compress_aai_turns(df_turns)
            # compute number of words eper speaker turn to unify format with deepgram
            df_turns["num_words"] = df_turns["words"].apply(lambda x: len(x))
            # Extract necessary columns
            df_turns = df_turns[["speaker", "text", "start", "end", "num_words"]]
            # Convert timestamps to seconds
            df_turns["start"] = df_turns["start"] / 1000
            df_turns["end"] = df_turns["end"] / 1000

        elif api_model == get_analysis_config().dg:
            # get speaker turns
            paragraphs = cast(list[dg_types.Utterance], paragraphs)
            #  Convert response to DataFrame
            df_turns = pd.DataFrame(paragraphs)
            df_turns["speaker"] = df_turns["channel"].apply(str)
            df_turns["text"] = df_turns["transcript"].apply(str)
            df_turns = compress_dg_turns(df_turns)

        # Assign turn numbers to each speaker
        df_turns["turn"] = df_turns.groupby("speaker").cumcount()
        # Speaker label as string
        df_turns["speaker"] = df_turns["speaker"].apply(str)
        return df_turns
    except Exception as e:
        logger.error(f"Issue {e} for function get_turns - api model = {api_model}")
        raise e


def get_conversation_as_list(df_turns: pd.DataFrame) -> list[dict[str, str]]:
    updated_conversation = [{"role": str(turn.speaker), "content": str(turn.text)} for turn in df_turns.itertuples()]
    return updated_conversation


OldSpeakerLabel = NewType("OldSpeakerLabel", str)
NewSpeakerLabel = Literal["user", "assistant"]


def cosine_similarity(a: list[float], b: list[float]) -> float:
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def guess_speakers(
    conversation_as_list: list[dict[str, str]], df_turns: pd.DataFrame
) -> dict[OldSpeakerLabel, NewSpeakerLabel]:
    """
    Given no assumption on the speaker order in the audio recording, it assigns:
    - `assistant` for the avatar aka customer
    - `user` for the trainee

    Flow:
    -> Split the Spar conversation (DB) into user and assistant messages
        -> Concatenate the messages
        -> Compute the embeddings
    -> Split the messages in df_turns into the different speakers/channels
        -> Concatenate the messages from the same speaker
        -> Compute embeddings
    -> Compute the cosine similarity
    -> Return the proper speaker labels as a dict of {old_label: new_label} values

    Remarks: can be made faster by parallelizing the embedding calls as well as the cosine similarity matrix computation,
             but is low priority since it's not really time consuming or time critical
    """
    avatar_messages = [msg["content"] for msg in conversation_as_list if msg["role"] == "assistant"]
    avatar_embeddings = embed_text("\n".join(avatar_messages))

    user_messages = [msg["content"] for msg in conversation_as_list if msg["role"] == "user"]
    user_embeddings = embed_text("\n".join(user_messages))

    # eg. A,B or 0,1 or 1,2 ...
    old_speakers: list[str] = df_turns["speaker"].unique().tolist()
    speaker_embeddings = {
        OldSpeakerLabel(speaker): embed_text(" ".join(df_turns.loc[df_turns["speaker"] == speaker, "text"].to_list()))
        for speaker in old_speakers
    }

    speaker_map: dict[OldSpeakerLabel, NewSpeakerLabel] = {}
    for speaker, embedding in speaker_embeddings.items():
        similarity_score_user = cosine_similarity(embedding, user_embeddings)
        similarity_score_avatar = cosine_similarity(embedding, avatar_embeddings)
        if similarity_score_user > similarity_score_avatar:
            speaker_map[speaker] = "user"
        else:
            speaker_map[speaker] = "assistant"

    # Check that no two speakers have been assigned to the same speaker
    if len(speaker_map) == len(set(speaker_map.values())):
        return speaker_map

    logger.warning("Some speakers have been assigned to the same speaker!")
    clip_length = 600
    avatar_transcript = "\n".join([f"assistant: {msg}" for msg in avatar_messages])
    # clip avatar transcript
    if len(avatar_transcript) > clip_length:
        avatar_transcript = avatar_transcript[:clip_length] + "..."
    user_transcript = "\n".join([f"user: {msg}" for msg in user_messages])
    # clip user transcript
    if len(user_transcript) > clip_length:
        user_transcript = user_transcript[:clip_length] + "..."
    speaker_transcripts = {
        OldSpeakerLabel(speaker): "\n".join(df_turns.loc[df_turns["speaker"] == speaker, "text"].to_list())
        for speaker in old_speakers
    }
    # clip speaker transcripts
    speaker_transcripts = {
        k: v[:clip_length] + "..." if len(v) > clip_length else v for k, v in speaker_transcripts.items()
    }
    speaker_map_gpt: dict[OldSpeakerLabel, NewSpeakerLabel] = {}
    for speaker, transcript in speaker_transcripts.items():
        guessed_speaker = gpt_speaker_guesser(
            user_transcript=user_transcript, assistant_transcript=avatar_transcript, transcript_to_identify=transcript
        )
        speaker_map_gpt[speaker] = guessed_speaker.speaker_role
    # Check that no two speakers have been assigned to the same speaker
    if len(speaker_map_gpt) == len(set(speaker_map_gpt.values())):
        return speaker_map_gpt

    logger.warning("Speaker guessing failed!")
    return {}


def get_timeline(df_turns: pd.DataFrame):
    grouped = df_turns.groupby("speaker")
    json_data = {}
    for speaker, group in grouped:
        json_data[speaker] = []
        for _, row in group.iterrows():
            json_data[speaker].append({"start": row["start"], "end": row["end"]})
    return json_data["assistant"], json_data["user"]
