from enum import StrEnum
from typing import TYPE_CHECKING, Annotated, Optional

from pydantic import BaseModel, field_validator
from sqlalchemy import ARRAY
from sqlmodel import JSON, Column, Field, Relationship, String
from typing_extensions import TypedDict

from app.api.admin.aiavatars.models import AIAvatar, SalesAIAvatarRead
from app.core.models.base_sql_model import SparSQLModel
from app.core.schemas import SparBaseSchemaModel

from ...admin.modules.objectives.models import Objective, SalesUserObjectiveRead
from ...admin.modules.promptconsiderations.models import PromptConsideration
from ..models_linking import ClientModuleLink, UserModuleLink
from ..spars.models import Spar

if TYPE_CHECKING:
    from ...admin.clients.models import Client


class ModuleConfig:
    json_schema_extra = {"example": {}}


class AvatarMode(StrEnum):
    SPEED = "Speed"
    REALISM = "Realism"


class ModuleLevel(StrEnum):
    BEGINNER = "Beginner"
    MEDIUM = "Medium"
    EXPERT = "Expert"


class ScenarioRoles(TypedDict):
    user: str
    avatar: str


DEFAULT_ROLES = ScenarioRoles(user="Salesman", avatar="Customer")


class Emotion(StrEnum):
    NEUTRAL = "neutral"
    SATISFIED = "satisfied"
    HAPPY = "happy"
    SAD = "sad"
    CONCERNED = "concerned"
    ANGRY = "angry"


class ScenarioBase(SparBaseSchemaModel):
    what_avatar_knows: Annotated[Optional[str], Field(max_length=500)]
    what_avatar_wants: Annotated[Optional[str], Field(max_length=500)]
    who_avatar_speaks_with: Annotated[Optional[str], Field(max_length=500)]
    who_avatar_accepts_refuses: Annotated[Optional[str], Field(max_length=500)]

    greeting_messages: Annotated[Optional[list[str]], Field(max_length=500, default=None)]

    # eg. {"user": "Salesperson", "avatar": "Client"}
    roles: Annotated[Optional[ScenarioRoles], Field(default={})]

    initial_emotion: Annotated[Emotion, Field(default=Emotion.NEUTRAL)]

    def to_dict(self):
        return self.model_dump()

    @classmethod
    def from_dict(cls, data_dict):
        return cls(**data_dict)


class ModuleBase(SparSQLModel, ModuleConfig):
    name: str = Field(max_length=100, sa_column=Column(String(100)))
    avatar_id: int = Field(foreign_key="aiavatar.id")
    system_prompt: str = Field(max_length=10000, sa_column=Column(String(10000)))
    scenario: ScenarioBase = Field(sa_column=Column(JSON))
    stt_phrase_list: Optional[list[str]] = Field(default=None, sa_column=Column(ARRAY(String(255))))
    session_time: Annotated[int, Field(gt=0, le=600, default=300)]
    level: ModuleLevel = Field(sa_column=Column(String(20), nullable=False), default=ModuleLevel.MEDIUM)
    avatar_mode: AvatarMode = Field(sa_column=Column(String(20), nullable=False), default=AvatarMode.SPEED)

    class Config:
        extra = "forbid"
        json_schema_extra = ModuleConfig.json_schema_extra


class Module(ModuleBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    aiavatar: Optional["AIAvatar"] = Relationship(back_populates="module")
    clients: list["Client"] = Relationship(back_populates="modules", link_model=ClientModuleLink)
    spars: list["Spar"] = Relationship(back_populates="module")
    objectives: list["Objective"] = Relationship(back_populates="module")
    promptconsiderations: list["PromptConsideration"] = Relationship(back_populates="module")
    user_links: list["UserModuleLink"] = Relationship(
        back_populates="module",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class ModuleCreate(ModuleBase):
    objectives: list[Objective] = []
    considerations: list[PromptConsideration] = []


class ModuleRead(ModuleBase):
    id: int
    aiavatar: Optional["AIAvatar"] = Relationship(back_populates="module")
    spars: list["Spar"] = Relationship(back_populates="module")
    clients: list["Client"] = Relationship(back_populates="modules", link_model=ClientModuleLink)
    user_links: list["UserModuleLink"] = Relationship(back_populates="module")


class SalesUserModuleRead(BaseModel):
    id: int
    name: str
    avatar_id: Optional[int]
    aiavatar: Optional[SalesAIAvatarRead]
    objectives: list[SalesUserObjectiveRead]
    session_time: int
    stt_phrase_list: Optional[list[str]]
    level: ModuleLevel

    @classmethod
    def from_orm(cls, obj: Module):
        return cls(
            id=obj.id,
            name=obj.name,
            avatar_id=obj.avatar_id,
            session_time=obj.session_time,
            aiavatar=SalesAIAvatarRead.from_orm(obj.aiavatar) if obj.aiavatar else None,
            objectives=[SalesUserObjectiveRead.from_orm(objective) for objective in obj.objectives],
            stt_phrase_list=obj.stt_phrase_list,
            level=obj.level,
        )


class SalesUserModuleSparsRead(BaseModel):
    id: int
    name: str
    avatar_id: Optional[int]
    session_time: int
    spars: list[Spar]
    stt_phrase_list: Optional[list[str]]
    level: ModuleLevel


class ModuleUpdate(SparSQLModel, ModuleConfig):
    name: Annotated[str | None, Field(max_length=100, sa_column=Column(String(100)))] = None
    system_prompt: Annotated[str | None, Field(max_length=10000, sa_column=Column(String(10000)))] = None
    avatar_id: int | None = None
    scenario: ScenarioBase | None = None
    stt_phrase_list: list[str] | None = None
    session_time: Annotated[int, Field(gt=0, le=600, default=300)]
    level: Annotated[ModuleLevel | None, Field(sa_column=Column(String(20)))] = None
    avatar_mode: Annotated[AvatarMode | None, Field(sa_column=Column(String(20)))] = AvatarMode.SPEED
    objectives: list[Objective] | None = None
    considerations: list[PromptConsideration] | None = None

    @field_validator("objectives")
    def validate_objectives(cls, v: list[Objective] | None):
        if v:
            return [Objective.model_validate(objective) for objective in v]
        return v

    @field_validator("considerations")
    def validate_considerations(cls, v: list[PromptConsideration] | None):
        if v:
            return [PromptConsideration.model_validate(consideration) for consideration in v]
        return v

    class Config:
        extra = "forbid"
        json_schema_extra = ModuleConfig.json_schema_extra


class Assignee(SparBaseSchemaModel):
    client_id: int
    user_ids: list[int]

    def to_dict(self):
        return self.model_dump()

    @classmethod
    def from_dict(cls, data_dict):
        return cls(**data_dict)


class AssignModules(SparBaseSchemaModel):
    assignees: list[Assignee]
    modules: list[int]

    def to_dict(self):
        return self.model_dump()

    @classmethod
    def from_dict(cls, data_dict):
        return cls(**data_dict)


class UserModulesResponse(BaseModel):
    module: SalesUserModuleRead
    is_completed: bool | None
    rating: int | None
    num_attempts: int | None


class UserModulesSparsResponse(BaseModel):
    module: SalesUserModuleSparsRead
    is_completed: bool | None
    rating: int | None
