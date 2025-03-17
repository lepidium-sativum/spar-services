class ErrorCode:
    INVALID_AWS_CREDENTIALS = "AWS credentials not available."
    S3_DOWNLOAD_FAILED = "Failed to download files from S3."
    S3_UPLOAD_FAILED = "Failed to upload file to S3"
    S3_FILE_META_FAILED = "Failed to received the metadata about file from S3"
    S3_SIGNED_URL_FAILED = "Generating S3 signed Url failed"
    URL_FILE_DOWNLOAD_FAILED = "Failed to download file from URL"
    URL_FILE_S3_UPLOAD_FAILED = "Failed to upload file from URL to S3"
