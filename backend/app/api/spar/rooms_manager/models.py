from sqlmodel import Field, Column, String, Relationship  # select,

from typing import Optional, TYPE_CHECKING  # List, Literal

# from sqlalchemy.dialects.postgresql import UUID
from enum import Enum

# from app.core.dependencies import DBSessionDep
from app.core.models.base_sql_model import SparSQLModel

if TYPE_CHECKING:
    from ..users.models import User
from ..spars.models import Spar
from ..instances.models.aws_instance import UEInstance, UEInstanceRead


class RoomStatus(str, Enum):
    TO_SETUP = "TO_SETUP"
    CREATING = "CREATING"
    STARTED = "STARTED"  # instance ON/RUNNING but not ready (UE App not running yet)
    READY = "READY"  # Ready to be used
    IN_USE = "IN_USE"  # Being used atm, UE app is running
    # UPDATING = "UPDATING"
    STOPPING = "STOPPING"  # Stopping or Shutting down (In AWS, these are separate)
    TERMINATED = "TERMINATED"  # deleted
    FAILED = "FAILED"
    INVALID = "invalid"


class RoomConfig:
    json_schema_extra = {}


class RoomBase(SparSQLModel, RoomConfig):
    name: str = Field(
        default=None,
        max_length=100,
        sa_column=Column(String(100), nullable=True),
    )
    metahuman: str = Field(
        default=None,  # "Henry"
        max_length=50,
        sa_column=Column(String(50), nullable=False),
    )
    background: str = Field(
        default=None,
        max_length=50,
        sa_column=Column(String(50), nullable=True),
    )
    tts_server: str = Field(
        default=None, max_length=500, sa_column=Column(String(500), nullable=False)
    )
    tts_port: int = Field(default=None, nullable=False)
    status: RoomStatus = RoomStatus.TO_SETUP
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")  # unique=True
    instance_id: Optional[int] = Field(
        default=None, foreign_key="ueinstance.id"
    )  # unique=True

    class Config:
        extra = "forbid"
        json_schema_extra = RoomConfig.json_schema_extra


class Room(RoomBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user: Optional["User"] = Relationship(back_populates="rooms")
    instance: Optional["UEInstance"] = Relationship(back_populates="room")
    spar: Optional["Spar"] = Relationship(back_populates="room")


class RoomCreate(RoomBase):
    id: int | None = None

    class Config:
        extra = "forbid"


class RoomRead(SparSQLModel):
    id: int
    name: str | None = None
    metahuman: str | None = None
    background: str | None = None
    tts_server: str | None = None
    tts_port: int | None = None
    status: RoomStatus | None = None
    user_id: int | None
    # user: Optional["User"]
    # instance: Optional[UEInstance]
    instance: Optional[UEInstance] = None
    spar: Optional[Spar] = None

    @classmethod
    def from_orm(cls, obj: Room, include_logs: bool = False):
        # from ..users.models import User

        # user = User.model_validate(obj.user) if obj.user else None
        instance = (
            UEInstanceRead.from_orm(obj.instance, include_logs=include_logs)
            if obj.instance
            else None
        )

        # instance = UEInstance.model_validate(obj.instance) if obj.instance else None
        spar = Spar.model_validate(obj.spar) if obj.spar else None

        return cls(
            id=obj.id,
            name=obj.name,
            metahuman=obj.metahuman,
            background=obj.background,
            tts_server=obj.tts_server,
            tts_port=obj.tts_port,
            status=obj.status,
            user_id=obj.user_id,
            # user=user,
            instance=instance,
            spar=spar,
        )


class RoomUpdate(SparSQLModel):
    metahuman: str | None = None
    background: str | None = None
    status: RoomStatus | None = None

    class Config:
        extra = "forbid"


class RoomResponse(SparSQLModel):
    id: int

    class Config:
        from_attributes: True
