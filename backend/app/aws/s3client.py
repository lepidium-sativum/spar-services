import boto3
import httpx
from botocore.exceptions import NoCredentialsError

from app.core.logger import logger
from .config import get_aws_config
from .exceptions import (
    InvalidAWSCredentials,
    S3MetaFailed,
    S3UploadFailed,
    S3DownloadFailed,
    S3SignedUrlFailed,
    UrlFileDownloadFailed,
    UrlFileS3UploadFailed,
    DetailedHTTPException,
)
from .constants import ErrorCode


def generate_signed_url(
    bucket_name, file_key, method, expiration=604800, content_type=None
):
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=get_aws_config().s3_access_key,
        aws_secret_access_key=get_aws_config().s3_secret_key,
        region_name=get_aws_config().s3_region,
    )
    try:
        presigned_url_params = {
            "Params": {"Bucket": bucket_name, "Key": file_key},
            "ExpiresIn": expiration,
        }
        if content_type:
            presigned_url_params["Params"].update({"ContentType": content_type})
        # logger.debug(f"presigned_url_params: {presigned_url_params}")
        signed_url = s3_client.generate_presigned_url(method, **presigned_url_params)
        return signed_url
    except NoCredentialsError:
        raise InvalidAWSCredentials
    except Exception:
        logger.error(ErrorCode.S3_DOWNLOAD_FAILED)
        raise S3SignedUrlFailed


def download_file(bucket_name, file_key, local_path):
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=get_aws_config().s3_access_key,
        aws_secret_access_key=get_aws_config().s3_secret_key,
        region_name=get_aws_config().s3_region,
    )
    try:
        s3_client.download_file(bucket_name, file_key, local_path)
        return True
    except Exception as e:
        logger.warning(ErrorCode.S3_DOWNLOAD_FAILED)
        raise S3DownloadFailed from e


def upload_file(bucket_name, file_key, local_path):
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=get_aws_config().s3_access_key,
        aws_secret_access_key=get_aws_config().s3_secret_key,
        region_name=get_aws_config().s3_region,
    )
    try:
        with open(local_path, "rb") as file:
            s3_client.upload_fileobj(file, bucket_name, file_key)
            return True
    except Exception:
        logger.error(ErrorCode.S3_UPLOAD_FAILED)
        raise S3UploadFailed


def get_file_meta(bucket_name, file_key):
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=get_aws_config().s3_access_key,
        aws_secret_access_key=get_aws_config().s3_secret_key,
        region_name=get_aws_config().s3_region,
    )
    try:
        file_meta = s3_client.head_object(Bucket=bucket_name, Key=file_key)
        return file_meta
    except Exception:
        logger.error(ErrorCode.S3_FILE_META_FAILED)
        raise S3MetaFailed


def copy_file_from_url_to_s3(file_url: str, bucket_name: str, s3_key: str):
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=get_aws_config().s3_access_key,
        aws_secret_access_key=get_aws_config().s3_secret_key,
        region_name=get_aws_config().s3_region,
    )
    try:
        with httpx.stream("GET", file_url) as response:
            response.raise_for_status()
            try:
                logger.info(response)
                s3_client.upload_fileobj(response.iter_bytes(), bucket_name, s3_key)
            except Exception as s3_error:
                logger.error(ErrorCode.URL_FILE_S3_UPLOAD_FAILED)
                raise UrlFileS3UploadFailed
                # raise UrlFileS3UploadFailed(
                #     original_error=f"Error uploading file to S3: {str(s3_error)}"
                # )
    except httpx.HTTPStatusError as http_error:
        logger.error(ErrorCode.URL_FILE_DOWNLOAD_FAILED)
        raise UrlFileDownloadFailed(
            original_error=f"HTTP error occurred: {http_error.response.text}"
        )
    except httpx.RequestError as request_error:
        logger.error(ErrorCode.URL_FILE_DOWNLOAD_FAILED)
        raise UrlFileDownloadFailed(
            original_error=f"Error downloading file from URL: {str(request_error)}"
        )
    except Exception as e:
        logger.exception(e)
        raise DetailedHTTPException()

    return True
