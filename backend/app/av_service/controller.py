# from .ffmpeg_service import merge_video_files, merge_audio_files
from .ffmpeg_process import merge_video_files, merge_audio_files
from .exceptions import MergingVideosFailed, MergingAudiosFailed


def merge_videos_controller(
    input_file1_path: str, input_file2_path: str, output_file_path: str
):
    success = merge_video_files(input_file1_path, input_file2_path, output_file_path)
    if not success:
        raise MergingVideosFailed
    return success


def merge_audios_controller(
    input_file1_path: str, input_file2_path: str, output_file_path: str
):
    success = merge_audio_files(input_file1_path, input_file2_path, output_file_path)
    if not success:
        raise MergingAudiosFailed
    return success
