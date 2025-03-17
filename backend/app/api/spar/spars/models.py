from sqlmodel import Field, Column, UUID, Relationship, String
import uuid
from typing import Optional, TYPE_CHECKING
from enum import Enum

from app.core.models.base_sql_model import SparSQLModel
from app.core.schemas import SparBaseSchemaModel

if TYPE_CHECKING:
    from ..modules.models import Module  # ModuleLevel
    from ..users.models import User
    from ..analysis.models import Analysis
    from ..instances.models.aws_instance import UEInstance
    from ..rooms_manager.models import Room


TOTAL_SESSION_DURATION = 300


class SparState(str, Enum):
    pending = "pending"
    started = "started"
    in_progress = "in_progress"
    half_done = "half_done"
    finished = "finished"
    failed = "failed"
    invalid = "invalid"


class SparVideoMergingState(str, Enum):
    started = "started"
    in_progress = "in_progress"
    finished = "finished"
    failed = "failed"
    invalid = "invalid"


class SparConfig:
    json_schema_extra = {}


class SparBase(SparSQLModel, SparConfig):
    name: str
    conversation: str | None = None
    state: SparState | None = SparState.pending
    total_session_duration: int = TOTAL_SESSION_DURATION
    current_session_duration: int = 0
    user_audio_id: uuid.UUID | None = Field(default=None, sa_column=Column(UUID(as_uuid=True), nullable=True))
    user_video_id: uuid.UUID | None = Field(default=None, sa_column=Column(UUID(as_uuid=True), nullable=True))
    avatar_audio_id: uuid.UUID | None = Field(default=None, sa_column=Column(UUID(as_uuid=True), nullable=True))
    avatar_video_id: uuid.UUID | None = Field(default=None, sa_column=Column(UUID(as_uuid=True), nullable=True))
    merged_audio_id: uuid.UUID | None = Field(default=None, sa_column=Column(UUID(as_uuid=True), nullable=True))
    merged_video_id: uuid.UUID | None = Field(default=None, sa_column=Column(UUID(as_uuid=True), nullable=True))
    video_merging_state: SparVideoMergingState | None = None
    video_merging_failure_reason: str | None = None
    avatar_audio_timeline: str | None = None
    user_audio_timeline: str | None = None

    user_id: int = Field(default=None, nullable=False, foreign_key="user.id")
    module_id: Optional[int] = Field(default=None, foreign_key="module.id")
    instance_id: Optional[int] = Field(default=None, foreign_key="ueinstance.id")  # unique=True, TODO: Required?
    room_id: Optional[int] = Field(default=None, foreign_key="room.id")
    socket_id: str | None = Field(default=None, max_length=255, sa_column=Column(String(255), nullable=True))
    is_active: bool | None = None

    @classmethod
    def generate_uuid(cls) -> uuid.UUID:
        return uuid.uuid4()

    class Config:
        extra = "forbid"
        json_schema_extra = SparConfig.json_schema_extra


class Spar(SparBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user: Optional["User"] = Relationship(back_populates="spars")
    module: Optional["Module"] = Relationship(back_populates="spars")
    instance: Optional["UEInstance"] = Relationship(back_populates="spar")
    room: Optional["Room"] = Relationship(back_populates="spar")
    analyses: list["Analysis"] = Relationship(back_populates="spar")
    rating: int | None = None


class SparCreate(SparBase):
    pass


class SparRead(SparBase):
    id: int
    user: Optional["User"] = Relationship(back_populates="spars")
    module: Optional["Module"] = Relationship(back_populates="spars")
    instance: Optional["UEInstance"] = Relationship(back_populates="spar")
    room: Optional["Room"] = Relationship(back_populates="spar")

    rating: int | None = None


class SparMedia(SparBaseSchemaModel):
    user_audio_url: str  # AnyHttpUrl
    user_video_url: str
    avatar_audio_url: str
    avatar_video_url: str


class SparMediaId(SparBaseSchemaModel):
    user_audio_id: uuid.UUID
    user_video_id: uuid.UUID
    avatar_audio_id: uuid.UUID
    avatar_video_id: uuid.UUID


class SparVideoStateUpdate(SparBaseSchemaModel):
    video_merging_state: SparVideoMergingState | None = None
    video_merging_failure_reason: str | None = None
    merged_video_id: uuid.UUID | None = None


class SparMediaMergedVideo(SparBaseSchemaModel):
    merged_video_url: str
    spar: SparRead


class SparMergedAudioTimeline(SparBaseSchemaModel):
    avatar_audio_timeline: str | None = None
    user_audio_timeline: str | None = None
    merged_audio_id: uuid.UUID | None = None


class SparReadToken(SparBaseSchemaModel):
    token: str
    spar: SparRead
    stt_phrase_list: Optional[list[str]]


class SparUpdate(SparBaseSchemaModel):
    state: SparState | None = None
    current_session_duration: int | None = None
    conversation: str | None = None
    rating: int | None = None
    avatar_audio_timeline: str | None = None
    user_audio_timeline: str | None = None

    class Config:
        extra = "forbid"
        json_schema_extra = SparConfig.json_schema_extra


class SparCommunicate(SparBaseSchemaModel):
    transcription: str

    class Config:
        extra = "forbid"
        json_schema_extra = SparConfig.json_schema_extra
