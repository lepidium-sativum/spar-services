from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    PrerecordedOptions,
    PrerecordedResponse,
    BufferSource,
)

from app.core.logger import logger
from .config import get_external_service_config


def transcribe_audio_file_with_options(
    file_path: str,
    output_filename: str | None = None,
    words_to_boost: list[str] | None = None,
) -> PrerecordedResponse | None:
    """
    Transcribes an audio file using the Deepgram API.

    Args:
        file_path (str): Path to the audio file.
        output_file (str): Filename for saving the transcription.
        words_to_boost (list[str]): List of words to boost.

    Returns:
        A dictionary containing the transcription response.
    """
    if words_to_boost is None:
        words_to_boost = []
    try:
        dg_config = DeepgramClientOptions(api_key=get_external_service_config().deepgram_api_key)
        client = DeepgramClient(config=dg_config)
        # TODO: maybe place these options in config instead
        options = PrerecordedOptions(
            model="nova-2",
            language="en",
            smart_format=True,
            utterances=True,
            punctuate=True,
            paragraphs=True,
            # diarize=True,
            filler_words=True,
            detect_topics=True,
            detect_entities=True,
            keywords=words_to_boost,
            replace="charlemagne:shalimar",
            search=["shalimar", "supervisor"],
            multichannel=True,
            channels=2,
        )
        with open(file_path, "rb") as f:
            buffer = f.read()
            return client.listen.prerecorded.v("1").transcribe_file(BufferSource(buffer=buffer), options)

    except Exception as e:
        logger.error(
            f"Exception with transcribe_audio_file_with_options: {e}. Input data: {file_path}  * {output_filename}"
        )
        return None