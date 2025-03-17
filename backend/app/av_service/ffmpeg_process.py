import subprocess

from app.core.logger import logger
from sentry_sdk import capture_exception
from .constants import ErrorCode


def merge_video_files(
    input_file1_path: str, input_file2_path: str, output_file_path: str
):
    try:
        command = ["ffmpeg"]
        command.extend(
            [
                "-i",
                input_file1_path,
                "-i",
                input_file2_path,
                "-y",
                "-filter_complex",
                "[0:v]scale=-1:480[v0];[1:v]scale=-1:480[v1];[v0][v1]hstack=inputs=2[outv];[0:a][1:a]amix=inputs=2[a]",
                "-map",
                "[outv]",
                "-map",
                "[a]",
                "-c:v",
                "libvpx",
                "-cpu-used",
                "6",
                "-threads",
                # "2",
                "12",
                "-b:v",
                "1M",
                "-c:a",
                "libvorbis",
                "-b:a",
                "128k",
                output_file_path,
            ]
        )
        logger.debug(f"command: {command}")
        subprocess.run(command, check=True)
        return True
    except subprocess.CalledProcessError as e:
        logger.warning(f"{ErrorCode.MERGING_VIDEOS_FAILED}: {e}")
        capture_exception(e)
        return False


def merge_audio_files(
    input_file1_path: str, input_file2_path: str, output_file_path: str
):
    # transform input audios to mono, then merge them into separated channels
    filter_complex = "[0:a]aformat=channel_layouts=mono[a1];[1:a]aformat=channel_layouts=mono[a2];[a1][a2]amerge=inputs=2,pan=stereo|c0<c0|c1<c1[a]"
    try:
        command = ["ffmpeg"]
        command.extend(
            [
                "-i",
                input_file1_path,
                "-i",
                input_file2_path,
                "-y",
                "-filter_complex",
                filter_complex,
                "-map",
                "[a]",
                output_file_path,
            ]
        )
        logger.debug(f"command: {command}")
        subprocess.run(command, check=True)
        return True
    except subprocess.CalledProcessError as e:
        logger.warning(f"{ErrorCode.MERGING_VIDEOS_FAILED}: {e}")
        capture_exception(e)
        return False
