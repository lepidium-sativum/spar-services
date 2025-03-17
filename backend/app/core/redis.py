from datetime import timedelta
from typing import Optional

from redis.asyncio import Redis as RedisAsync

from app.core.config import get_base_config

from .logger import logger
from .schemas import SparBaseSchemaModel

redis_client_async: RedisAsync = RedisAsync.from_url(
    str(get_base_config().redis_url), max_connections=10, decode_responses=True
)


async def test_redis_conn():
    try:
        await set_redis_key(RedisData(key="conntest", value="test", ttl=timedelta(seconds=10)))
    except Exception as e:
        logger.error(f"Error connecting to Redis: {e}")
        raise


async def get_redis() -> RedisAsync:
    return redis_client_async


class RedisData(SparBaseSchemaModel):
    key: bytes | str
    value: bytes | str
    ttl: Optional[int | timedelta] = None


async def set_redis_key(redis_data: RedisData, *, is_transaction: bool = False) -> None:
    async with redis_client_async.pipeline(transaction=is_transaction) as pipe:
        await pipe.set(redis_data.key, redis_data.value)
        if redis_data.ttl:
            await pipe.expire(redis_data.key, redis_data.ttl)

        await pipe.execute()


async def get_by_key(key: str) -> Optional[str]:
    return await redis_client_async.get(key)


async def delete_by_key(key: str) -> None:
    return await redis_client_async.delete(key)
