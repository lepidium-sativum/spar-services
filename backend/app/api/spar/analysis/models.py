import uuid
from enum import Enum
from typing import TYPE_CHECKING, Optional

from pydantic import computed_field
from sqlalchemy.orm import RelationshipProperty
from sqlmodel import Field, Relationship, UniqueConstraint

from app.core.models.base_sql_model import SparSQLModel
from app.core.schemas import SparBaseSchemaModel

if TYPE_CHECKING:
    from ..spars.models import Spar


class AnalysisState(str, Enum):
    started = "started"
    in_progress = "in_progress"
    finished = "finished"
    failed = "failed"


class AnalysisConfig:
    json_schema_extra = {}


class AnalysisBase(SparSQLModel, AnalysisConfig):
    state: AnalysisState | None = AnalysisState.started
    # client_id: int = Field(default=None, nullable=True, foreign_key="client.id")
    spar_id: int = Field(default=None, nullable=False, foreign_key="spar.id")
    text_analysis: str | None = None
    audio_analysis: str | None = None
    failure_reason: str | None = None
    audio_conversation: str | None = None

    @classmethod
    def generate_uuid(cls) -> uuid.UUID:
        return uuid.uuid4()

    class Config:
        extra = "forbid"
        json_schema_extra = AnalysisConfig.json_schema_extra
        constraints = [UniqueConstraint("spar_id", name="unique_spar_id")]


class Analysis(AnalysisBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    spar: Optional["Spar"] = Relationship(
        back_populates="analyses", sa_relationship=RelationshipProperty(lazy="joined")
    )

    @computed_field
    @property
    def rating(self) -> int | None:
        return self.spar.rating if self.spar else None


class AnalysisCreate(AnalysisBase):
    pass


class AnalysisRead(AnalysisBase):
    id: int
    rating: int | None
    # state: AnalysisState


class AnalysisUpdate(SparBaseSchemaModel):
    state: AnalysisState | None = None
    text_analysis: str | None = None
    audio_analysis: str | None = None
    failure_reason: str | None = None
    audio_conversation: str | None = None
