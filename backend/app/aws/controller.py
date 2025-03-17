from .s3client import generate_signed_url, download_file, upload_file, get_file_meta
from .exceptions import S3DownloadFailed, S3UploadFailed
from .config import get_aws_config


def get_mh_upload_signed_url_controller(file_key: str):
    return generate_signed_url(
        get_aws_config().s3_metahumans_bucket, file_key, method="put_object"
    )


def get_mh_download_signed_url_controller(file_key: str):
    return generate_signed_url(
        get_aws_config().s3_metahumans_bucket, file_key, "get_object"
    )


def get_mh_file_meta_controller(file_key: str):
    return get_file_meta(get_aws_config().s3_metahumans_bucket, file_key)


def get_bg_image_upload_signed_url_controller(file_key: str):
    return generate_signed_url(
        get_aws_config().s3_bg_images_bucket, file_key, method="put_object"
    )


def get_bg_image_download_signed_url_controller(file_key: str):
    return generate_signed_url(
        get_aws_config().s3_bg_images_bucket, file_key, "get_object"
    )


def get_bg_image_file_meta_controller(file_key: str):
    return get_file_meta(get_aws_config().s3_bg_images_bucket, file_key)


def get_media_upload_signed_url_controller(file_key: str):
    return generate_signed_url(
        get_aws_config().s3_media_bucket, file_key, method="put_object"
    )


def get_media_download_signed_url_controller(file_key: str):
    return generate_signed_url(get_aws_config().s3_media_bucket, file_key, "get_object")


def download_media_file_controller(file_key: str, local_path: str):
    success = download_file(
        bucket_name=get_aws_config().s3_media_bucket,
        file_key=file_key,
        local_path=local_path,
    )
    if not success:
        raise S3DownloadFailed
    return success


def upload_media_file_controller(file_key: str, local_path: str):
    success = upload_file(
        bucket_name=get_aws_config().s3_media_bucket,
        file_key=file_key,
        local_path=local_path,
    )
    if not success:
        raise S3UploadFailed
    return success
