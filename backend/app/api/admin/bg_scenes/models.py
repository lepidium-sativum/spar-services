from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, Column, String, JSON, UUID
import uuid

from app.core.models.base_sql_model import SparSQLModel
from app.core.schemas import SparBaseSchemaModel

if TYPE_CHECKING:
    from ..aiavatars.models import AIAvatar


ALLOWED_MH_BACKGROUNDS = ("autoshop", "dancehall", "decorshop", "phoneshop", "empty")


class BackgroundImage(SparBaseSchemaModel):
    name: Optional[str] = Field(max_length=100, sa_column=Column(String(100)))
    image_id: uuid.UUID = Field(sa_column=Column(UUID(as_uuid=True), nullable=True))
    file_extension: Optional[str] = Field(default="png", max_length=10, sa_column=Column(String(10)))
    etag: Optional[str] = None
    url: Optional[str] = Field(default=None, max_length=255, sa_column=Column(String(255)))

    def to_dict(self):
        return self.model_dump()

    @classmethod
    def from_dict(cls, data_dict):
        return cls(**data_dict)


class BGSceneBase(SparSQLModel):
    name: Optional[str] = Field(max_length=100, sa_column=Column(String(100)))
    ue_scene_id: Optional[str] = Field(default=None, max_length=60, sa_column=Column(String(60)))
    background_image: BackgroundImage = Field(sa_column=Column(JSON))

    @classmethod
    def generate_uuid(cls) -> uuid.UUID:
        return uuid.uuid4()


class BGScene(BGSceneBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    aiavatar: Optional["AIAvatar"] = Relationship(back_populates="bgscene", sa_relationship_kwargs={"uselist": False})


class BGSceneCreate(BGSceneBase):
    pass


class BGSceneRead(BGSceneBase):
    id: int
