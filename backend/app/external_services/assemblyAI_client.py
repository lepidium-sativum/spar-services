import assemblyai as aai
from sentry_sdk import capture_exception

# remove the dependency
from app.api.spar.analysis.config import get_analysis_config
from app.core.logger import logger
from .config import get_external_service_config


def aai_sdk_transcribe_audio_file(file_url: str, words_to_boost: list[str]) -> aai.Transcript | None:
    """
    Transcribe an audio file using the AssemblyAI API.
    It take the file URL as an argument and return the transcript or any error encountered during transcription.

    Args:
        file_url (str): The URL or local file path of the audio file to transcribe.

    Returns:
        aai.Transcript: The transcript of the audio file.
    """
    try:
        # Replace with your API key
        aai.settings.api_key = get_external_service_config().assembly_api_key
        aai.settings.http_timeout = 300
        # Configuration for transcription
        config = aai.TranscriptionConfig(
            dual_channel=True,
            speakers_expected=2,
            format_text=True,
            punctuate=True,
            auto_highlights=True,
            disfluencies=True,
            filter_profanity=False,
            # https://www.assemblyai.com/docs/speech-to-text/speech-recognition#custom-vocabulary
            word_boost=words_to_boost,
            boost_param=aai.WordBoost.high,
            language_code=aai.LanguageCode.en_us,
        )

        # TODO: remove and use phrase_list
        config.set_custom_spelling({"SUPERVISOR": ["supervisor"]})

        transcriber = aai.Transcriber()
        transcript = transcriber.transcribe(file_url, config=config)

        matches = transcript.word_search(get_analysis_config().filler_words)

        for match in matches:
            logger.debug(f"Found '{match.text}' {match.count} times in the transcript")

        if transcript.status == aai.TranscriptStatus.error:
            logger.error(f"Transcription failed: {transcript.error}")
            return None
        else:
            return transcript
    except Exception as e:
        capture_exception(e)
        logger.warning(f"Error {e} for function aai_sdk_transcribe_audio_file and file_url {file_url}")
        return None
