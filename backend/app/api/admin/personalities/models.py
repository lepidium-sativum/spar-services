from typing import TYPE_CHECKING, Optional

from sqlmodel import JSON, Column, Field, Relationship, String

from app.core.models.base_sql_model import SparSQLModel
from app.core.schemas import SparBaseSchemaModel

from .util import read_file

if TYPE_CHECKING:
    from ..aiavatars.models import AIAvatar

ALLOWED_MODEL_STYLES = ("RED", "BLUE", "GREEN", "YELLOW")
TTS_REGIONS = read_file("tts_regions.json")
TTS_LANGS_VOICES = read_file("tts_langs_voices.json")


class LLM(SparBaseSchemaModel):
    style: Optional[str] = Field(default=None, max_length=500, sa_column=Column(String(500)))
    model: Optional[str] = Field(max_length=60, sa_column=Column(String(60)))
    temperature: Optional[float] = Field(default=0.5, ge=0.0, le=1.0)
    url: Optional[str] = Field(default=None, max_length=255, sa_column=Column(String(255)))
    type: Optional[str] = Field(default=None, max_length=60, sa_column=Column(String(60)))

    def to_dict(self):
        return self.model_dump()

    @classmethod
    def from_dict(cls, data_dict):
        return cls(**data_dict)


class TTS(SparBaseSchemaModel):
    lang: str | None = Field(
        default="en-US",
        max_length=6,
        sa_column=Column(String(6)),
        description="lang should be in this format en-US",
    )
    voice: Optional[str] = Field(default=None, max_length=60, sa_column=Column(String(60)))
    region: Optional[str] = Field(default=None, max_length=60, sa_column=Column(String(60)))

    def to_dict(self):
        return self.model_dump()

    @classmethod
    def from_dict(cls, data_dict):
        return cls(**data_dict)


class PersonalityBase(SparSQLModel):
    name: str = Field(max_length=100, sa_column=Column(String(100), nullable=False, unique=True))
    description: Optional[str] = Field(default=None, max_length=500, sa_column=Column(String(500)))
    personality_info: Optional[str] = Field(max_length=500, sa_column=Column(String(500)))
    instructions: Optional[str] = Field(default=None, max_length=500, sa_column=Column(String(500)))
    llm: LLM = Field(sa_column=Column(JSON))  # None
    tts: Optional[TTS] = Field(default=None, sa_column=Column(JSON))


class Personality(PersonalityBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    aiavatar: Optional["AIAvatar"] = Relationship(
        back_populates="personality", sa_relationship_kwargs={"uselist": False}
    )


class PersonalityCreate(PersonalityBase):
    pass


class PersonalityRead(PersonalityBase):
    id: int
