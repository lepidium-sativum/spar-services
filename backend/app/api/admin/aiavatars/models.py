from pydantic import BaseModel
from sqlmodel import Field, Column, String, Relationship
from typing import Optional, TYPE_CHECKING

from app.api.admin.metahumans.models import MetaHuman, MetaHumanRead
from app.api.admin.personalities.models import PersonalityRead
from app.core.models.base_sql_model import SparSQLModel
from app.aws.controller import (
    get_bg_image_download_signed_url_controller,
    get_mh_download_signed_url_controller,
)

from ..bg_scenes.models import BGSceneRead, BackgroundImage

if TYPE_CHECKING:
    from ..bg_scenes.models import BGScene
    from ..personalities.models import Personality
    from ...spar.modules.models import Module


class AIAvatarConfig:
    json_schema_extra = {}


class AIAvatarBase(SparSQLModel, AIAvatarConfig):
    name: Optional[str] = Field(max_length=100, sa_column=Column(String(100)))
    lang: str | None = Field(
        default="en-US",
        max_length=6,
        sa_column=Column(String(6)),
        description="lang should be in this format en-US",
    )
    metahuman_id: Optional[int] = Field(default=None, foreign_key="metahuman.id")  # unique=True
    bgscene_id: Optional[int] = Field(default=None, foreign_key="bgscene.id")  # unique=True
    personality_id: Optional[int] = Field(default=None, foreign_key="personality.id")  # unique=True

    class Config:
        extra = "forbid"
        json_schema_extra = AIAvatarConfig.json_schema_extra


class AIAvatar(AIAvatarBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    metahuman: Optional[MetaHuman] = Relationship(back_populates="aiavatar")
    bgscene: Optional["BGScene"] = Relationship(back_populates="aiavatar")
    personality: Optional["Personality"] = Relationship(back_populates="aiavatar")
    module: Optional["Module"] = Relationship(back_populates="aiavatar")  # sa_relationship_kwargs={"uselist": False}

    @staticmethod
    def assign_signed_urls(aiavatar):
        if aiavatar.bgscene and aiavatar.bgscene.background_image:
            if isinstance(aiavatar.bgscene.background_image, dict):
                aiavatar.bgscene.background_image = BackgroundImage.from_dict(aiavatar.bgscene.background_image)
                bg_image_url = get_bg_image_download_signed_url_controller(
                    file_key=f"{aiavatar.bgscene.background_image.image_id}.png"
                )
                aiavatar.bgscene.background_image.url = bg_image_url
        if aiavatar.metahuman:
            mh_url = get_mh_download_signed_url_controller(file_key=f"{aiavatar.metahuman.image_id}.png")
            aiavatar.metahuman.url = mh_url


class AIAvatarCreate(AIAvatarBase):
    pass


class AIAvatarRead(AIAvatarBase):
    id: int
    metahuman: Optional["MetaHuman"] = Relationship(back_populates="aiavatar")
    bgscene: Optional["BGScene"] = Relationship(back_populates="aiavatar")
    personality: Optional["Personality"] = Relationship(back_populates="aiavatar")


class SalesAIAvatarRead(BaseModel):
    # To send to the Sales-Spar Interface
    id: int
    name: Optional[str]
    lang: Optional[str]
    metahuman: Optional[MetaHumanRead]
    bgscene: Optional[BGSceneRead]
    personality: Optional[PersonalityRead]

    @classmethod
    def from_orm(cls, obj: AIAvatar):
        metahuman = MetaHumanRead.model_validate(obj.metahuman) if obj.metahuman else None
        bgscene = BGSceneRead.model_validate(obj.bgscene) if obj.bgscene else None
        personality = PersonalityRead.model_validate(obj.personality) if obj.personality else None
        return cls(
            id=obj.id,
            name=obj.name,
            lang=obj.lang,
            metahuman=metahuman,
            bgscene=bgscene,
            personality=personality,
        )


class AIAvatarUpdate(AIAvatarBase, AIAvatarConfig):
    lang: str | None = None

    class Config:
        extra = "forbid"
        json_schema_extra = AIAvatarConfig.json_schema_extra
