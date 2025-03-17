import uuid
from typing import TYPE_CHECKING, Optional

from pydantic import field_validator
from sqlmodel import UUID, Column, Field, Relationship, String

from app.core.models.base_sql_model import SparSQLModel

if TYPE_CHECKING:
    from ..aiavatars.models import AIAvatar


ALLOWED_MH_NAMES = ("Henry", "Vivian", "Samir", "Rami", "Fadi", "Elias", "Layla", "Yara", "Ziad")


class MetaHumanBase(SparSQLModel):
    name: str = Field(max_length=100, sa_column=Column(String(100), nullable=False, unique=True))
    gender: str = Field(max_length=10, sa_column=Column(String(10)))
    age: int = 0
    race: Optional[str] = Field(default=None, max_length=30, sa_column=Column(String(30)))
    url: Optional[str] = Field(default=None, max_length=1000, sa_column=Column(String(1000)))
    ue_mh_id: Optional[str] = Field(default=None, max_length=60, sa_column=Column(String(60)))
    image_id: uuid.UUID | None = Field(default=None, sa_column=Column(UUID(as_uuid=True)))  # nullable=True

    @classmethod
    def generate_uuid(cls) -> uuid.UUID:
        return uuid.uuid4()


class MetaHuman(MetaHumanBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    aiavatar: Optional["AIAvatar"] = Relationship(back_populates="metahuman", sa_relationship_kwargs={"uselist": False})


class MetaHumanCreate(MetaHumanBase):
    pass


class MetaHumanRead(MetaHumanBase):
    id: int


class MetaHumanUpdate(MetaHumanBase):
    pass
