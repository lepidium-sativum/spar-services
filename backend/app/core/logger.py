from app.core.config import get_base_config

LOG_FORMAT = "%(message)s"

if get_base_config().environment.is_deployed or get_base_config().environment.is_debug:
    # https://docs.pydantic.dev/latest/integrations/rich/
    import logging
    from rich.logging import RichHandler

    # import sys
    from devtools import debug

    logging.basicConfig(
        level=logging.INFO,
        format=LOG_FORMAT,
        handlers=[
            RichHandler(
                rich_tracebacks=True,
                tracebacks_show_locals=False,
                show_time=True,
                show_level=True,
                show_path=True,
                # max_frames=5,
            )
        ],
    )

    logger = logging.getLogger()
    logger.debug = debug
    logger.info("Using 'rich' logging in development environment")

else:
    pass
