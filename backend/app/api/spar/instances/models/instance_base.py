# from datetime import datetime
from sqlmodel import Field  # Column, String
from typing import Optional

from app.core.models.base_sql_model import SparSQLModel


class InstanceConfig:
    json_schema_extra = {}


class InstanceBase(SparSQLModel, InstanceConfig):
    # __abstract__ = True
    provider: str = Field(max_length=20, nullable=False)
    region: str = Field(max_length=15, nullable=False)
    logs: Optional[str] = Field(default=None, max_length=100000)

    server_public_ip: Optional[str] = Field(default=None, max_length=15, nullable=True)
    # availability_zone


class InstanceCreate(InstanceBase):
    class Config:
        extra = "forbid"


class InstanceUpdate(SparSQLModel):
    server_public_ip: str | None = None

    class Config:
        extra = "forbid"
