from slowapi import Limiter  # _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse

from app.core.redis import get_redis

limiter = Limiter(key_func=get_remote_address)


def add_rate_limit_middleware(app: FastAPI):
    app.add_middleware(SlowAPIMiddleware)

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
        # retry_after = int(exc.detail.split(" ")[-1])
        response_body = {
            "detail": "Rate limit exceeded. Please try again in 10 minutes.",
            "retry_after_minutes": 10,
        }
        return JSONResponse(
            status_code=429,
            content=response_body,
            # headers={"Retry-After": str(600)},
        )


async def get_redis_limiter() -> Limiter:
    # client's IP address as the key, not email
    redis_client = await get_redis()
    return Limiter(
        key_func=get_remote_address,
        storage_uri=f"redis://{redis_client.connection_pool.connection_kwargs['host']}:{redis_client.connection_pool.connection_kwargs['port']}",
    )


async def init_rate_limiter(app: FastAPI):
    global limiter
    limiter = await get_redis_limiter()
    app.state.limiter = limiter
    # spar_api.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


def rate_limiter_dep():
    """
    Inject the request object for SlowAPI, wherever need by rate limiter
    """

    async def dependency(request: Request = Depends()):
        pass

    return dependency
