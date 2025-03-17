from datetime import datetime
import secrets
import string
from enum import Enum
from sqlmodel import Field, Column, String, select, Relationship
from typing import Optional, TYPE_CHECKING

from app.core.dependencies import DBSessionDep

from .instance_base import InstanceBase, InstanceCreate, InstanceUpdate

SERVER_NAME_LENGTH = 4


if TYPE_CHECKING:
    from ...rooms_manager.models import Room
    from ...spars.models import Spar


# TODO: Maintain InstanceState and UEState separately. Or status/task_status
class UEInstanceStatus(str, Enum):
    TO_ACQUIRE = "TO_ACQUIRE"
    CREATING = "CREATING"  # acquiring
    AVAILABLE = "AVAILABLE"  # Stopped/Available = acquired in AWS = server off (available to get READY to be used again) - needs to be both UE and App started
    STARTING = "STARTING"  # Instance starting
    STARTED = "STARTED"  # instance ON/RUNNING but not ready (UE App not running yet)
    STARTING_APP = "STARTING_APP"  # App starting
    READY = "READY"  # Ready to be used
    IN_USE = "IN_USE"  # Being used atm, UE app is running
    STOPPING_APP = "STOPPING_APP"  # App stopping
    STOPPING = "STOPPING"  # Instance stopping
    TERMINATING = "TERMINATING"  # Shutting down
    TERMINATED = "TERMINATED"  # deleted
    TERMINATION_FAILED = "TERMINATION_FAILED"
    FAILED = "FAILED"
    INVALID = "INVALID"


class UEInstanceBase(InstanceBase):
    status: UEInstanceStatus = UEInstanceStatus.TO_ACQUIRE
    server_name: str = (Field(max_length=SERVER_NAME_LENGTH, nullable=False, unique=True),)
    server_instance_id: Optional[str] = Field(
        default=None,
        max_length=55,
        sa_column=Column(String(55), nullable=True),
    )  # unique=True, index=True
    # coturn_service_name (NOT BEING USED?)
    coturn_alb_domain: Optional[str] = Field(
        default=None,
        max_length=300,
        sa_column=Column(String(300), nullable=True),
    )
    pixel_streaming_port: int | None = Field(default=8888, nullable=True)
    # coturn_service_alb_dns = pixel_streaming_ip
    coturn_service_alb_dns: Optional[str] = Field(
        default=None,
        max_length=300,
        sa_column=Column(String(300), nullable=True),
    )

    @classmethod
    def get_by_server_name(cls, db: DBSessionDep, server_name: str) -> "UEInstance | None":
        instance = db.exec(select(cls).where(cls.server_name == server_name)).first()
        return instance

    @classmethod
    def generate_unique_server_name(cls) -> str:
        return "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(SERVER_NAME_LENGTH))


class UEInstance(UEInstanceBase, table=True):
    __tablename__ = "ueinstance"
    id: int | None = Field(default=None, primary_key=True)
    room: Optional["Room"] = Relationship(back_populates="instance", sa_relationship_kwargs={"uselist": False})
    spar: Optional["Spar"] = Relationship(back_populates="instance", sa_relationship_kwargs={"uselist": False})

    @classmethod
    def get_by_server_instance_id(cls, db: DBSessionDep, server_instance_id: str) -> "UEInstance | None":
        instance = db.exec(select(cls).where(cls.server_instance_id == server_instance_id)).first()
        return instance


class UEInstanceCreate(UEInstanceBase, InstanceCreate):
    class Config:
        extra = "forbid"


class UEInstanceRead(UEInstanceBase):  # InstanceRead
    id: int
    server_instance_id: str | None = None
    coturn_alb_domain: str | None = None
    coturn_service_alb_dns: str | None = None
    pixel_streaming_port: int | None = None
    status: UEInstanceStatus | None = None

    @classmethod
    def from_orm(cls, obj: UEInstance, include_logs: bool = False):
        data = {
            "id": obj.id,
            "provider": obj.provider,
            "region": obj.region,
            "server_name": obj.server_name,
            "coturn_alb_domain": obj.coturn_alb_domain,
            "status": obj.status,
        }
        if include_logs:
            data["logs"] = obj.logs
        return cls(**data)


class UEInstanceUpdate(InstanceUpdate):
    server_instance_id: str | None = None
    server_name: str | None = None
    coturn_alb_domain: str | None = None
    coturn_service_alb_dns: str | None = None
    pixel_streaming_port: int | None = None  # 8888
    status: UEInstanceStatus | None = None
    last_edited: datetime | None = None
    logs: str | None = None

    class Config:
        extra = "forbid"
