from typing import TYPE_CHECKING, Optional  # List,

from pydantic import BaseModel
from sqlmodel import Column, Field, Relationship, String

from app.core.models.base_sql_model import SparSQLModel

if TYPE_CHECKING:
    from ....spar.modules.models import Module


class ObjectiveBase(SparSQLModel):
    title: str = Field(max_length=100, sa_column=Column(String(100)))
    description: str = Field(max_length=500, sa_column=Column(String(500)))
    expanded_objective: Optional[str] = Field(max_length=2000, sa_column=Column(String(2000)))
    analysis_prompt: str = Field(max_length=10000, sa_column=Column(String(10000), nullable=False))
    module_id: Optional[int] = Field(default=None, foreign_key="module.id")


class Objective(ObjectiveBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    module: Optional["Module"] = Relationship(back_populates="objectives")


class SalesUserObjectiveRead(BaseModel):
    id: int
    title: str
    description: str
    expanded_objective: str | None

    @classmethod
    def from_orm(cls, obj: Objective):
        return cls(
            id=obj.id,
            title=obj.title,
            description=obj.description,
            expanded_objective=obj.expanded_objective,
        )


class ObjectiveCreate(ObjectiveBase):
    pass


class ObjectiveExpand(SparSQLModel):
    title: str = Field(max_length=100, sa_column=Column(String(100)))
    description: str = Field(max_length=500, sa_column=Column(String(500)))


class ObjectiveRead(ObjectiveBase):
    id: int
