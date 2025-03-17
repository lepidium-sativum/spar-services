from contextlib import asynccontextmanager
from pathlib import Path

import sentry_sdk
from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.api import api_router
from app.api.llms.clients.langfuse import connect_langfuse_client
from app.api.spar.rooms_manager.room_lifecycle_manager import (
    start_room_lifecycle_management,
    stop_room_lifecycle_management,
)
from app.core.config import get_base_config
from app.core.database import close_db_engine
from app.core.logger import logger
from app.core.openapi_config import app_configs, tags_metadata
from app.core.ratelimiter import add_rate_limit_middleware, init_rate_limiter
from app.core.redis import test_redis_conn
from app.core.util import JSONResponseWIP
from app.dummy.mock_db_data import create_dummy_data


def run_migrations():
    logger.info("Running alembic migrations")
    alembic_cfg = Config(Path(__file__).parent.parent / "alembic.ini")
    alembic_cfg.get_main_option("script_location")
    alembic_cfg.config_file_name = None  # to prevent alembic from overriding the logs
    command.upgrade(alembic_cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("startup: triggered")
    await test_redis_conn()
    await init_rate_limiter(app)
    if get_base_config().run_migrations:
        run_migrations()
    connect_langfuse_client()
    await start_room_lifecycle_management()
    if get_base_config().environment.is_debug:
        create_dummy_data()

    yield
    if get_base_config().environment.is_testing:
        return
    logger.info("shutdown: triggered")
    close_db_engine()
    await stop_room_lifecycle_management()


def create_app():
    sentry_sdk.init(
        dsn=get_base_config().sentry_dsn,
        traces_sample_rate=1.0,  # to capture 100%
        profiles_sample_rate=1.0,  # to profile 100% of sampled transactions
        attach_stacktrace=True,
        # debug=True,
        environment=get_base_config().environment,
    )

    spar_api = FastAPI(**app_configs, openapi_tags=tags_metadata, lifespan=lifespan)
    add_rate_limit_middleware(app=spar_api)

    spar_api.add_middleware(
        CORSMiddleware,
        allow_origins="*",
        allow_credentials=True,
        allow_methods=("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"),
        allow_headers=["*"],
    )
    spar_api.include_router(api_router, default_response_class=JSONResponseWIP)

    return spar_api
