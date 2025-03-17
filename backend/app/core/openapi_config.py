from fastapi.routing import APIRoute
from typing import Any

from .config import get_base_config
from app import __version__


def custom_generate_unique_id(route: APIRoute):
    return f"{route.tags[0]}-{route.name}"


app_configs: dict[str, Any] = {
    "title": "SPAR API",
    "version": __version__,
    "summary": "All the SPAR APIs",
    "description": "Welcome to the SPAR API.",
    "contact": {"name": "Henry Obegi"},
    "openapi_url": f"/api/v{get_base_config().api_version}/openapi.json",
    "generate_unique_id_function": custom_generate_unique_id,
    "docs_url": "/docs",  # None
    "redoc_url": "/redoc",
}

# https://fastapi.tiangolo.com/how-to/extending-openapi/#generate-the-openapi-schema
tags_metadata = [
    {"name": "Auth", "description": "All the APIs related to **user registeration** and **authN/authZ**."},
    {"name": "Spars", "description": "Spar APIs."},
]

if get_base_config().environment.is_deployed:
    app_configs["root_path"] = f"/v{get_base_config().api_version}"
if not get_base_config().environment.is_debug:
    app_configs["openapi_url"] = None  # hide docs
