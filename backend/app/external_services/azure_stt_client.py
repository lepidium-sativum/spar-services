import httpx

from app.core.exceptions import DetailedHTTPException, FailedDependency
from app.core.logger import logger

from .config import get_external_service_config


async def get_azure_stt_token():
    # expiration_time = datetime.utcnow() + timedelta(minutes=5)
    azure_key = get_external_service_config().azure_stt_key
    azure_region = get_external_service_config().azure_stt_region
    url = f"https://{azure_region}.api.cognitive.microsoft.com/sts/v1.0/issueToken"

    headers = {"Ocp-Apim-Subscription-Key": azure_key}
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers)
            if response.status_code == 200:
                return response.text
            else:
                raise FailedDependency
    except Exception as e:
        logger.error(e)
        raise DetailedHTTPException
