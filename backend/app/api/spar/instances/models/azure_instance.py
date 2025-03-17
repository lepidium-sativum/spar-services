from datetime import datetime
import secrets
import string
from enum import Enum
from sqlmodel import Field, Column, String
from typing import Optional

from .instance_base import InstanceBase, InstanceCreate, InstanceUpdate


SERVER_NAME_LENGTH = 50


class LLMInstanceStatus(str, Enum):
    TO_START = "TO_START"
    STARTING = "STARTING"  # Instance starting
    READY = "READY"  # Ready to be used
    TERMINATING = "TERMINATING"  # Shutting down
    TERMINATED = "TERMINATED"  # deleted
    TERMINATION_FAILED = "TERMINATION_FAILED"
    FAILED = "FAILED"
    INVALID = "INVALID"


class LLMInstanceBase(InstanceBase):
    status: LLMInstanceStatus = LLMInstanceStatus.TO_START
    server_name: str = (Field(max_length=SERVER_NAME_LENGTH, nullable=False, unique=True),)
    azure_subscription_id: Optional[str] = Field(
        default=None,
        max_length=250,
        sa_column=Column(String(250), nullable=True),
    )
    azure_vm_name: Optional[str] = Field(
        default=None,
        max_length=250,
        sa_column=Column(String(250), nullable=True),
    )
    azure_resource_group: Optional[str] = Field(
        default=None,
        max_length=250,
        sa_column=Column(String(250), nullable=True),
    )
    azure_tenant: Optional[str] = Field(
        default=None,
        max_length=250,
        sa_column=Column(String(250), nullable=True),
    )

    @classmethod
    def generate_unique_server_name(cls) -> str:
        return "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(SERVER_NAME_LENGTH))


class LLMInstance(LLMInstanceBase, table=True):
    id: int | None = Field(default=None, primary_key=True)


class LLMInstanceCreate(LLMInstanceBase, InstanceCreate):
    class Config:
        extra = "forbid"


class LLMInstanceRead(LLMInstanceBase):
    pass


class LLMInstanceUpdate(InstanceUpdate):
    server_name: str | None = None
    status: LLMInstanceStatus | None = None
    last_edited: datetime | None = None
    logs: str | None = None

    class Config:
        extra = "forbid"
