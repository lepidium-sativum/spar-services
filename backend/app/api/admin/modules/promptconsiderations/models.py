from typing import TYPE_CHECKING, Optional

from sqlmodel import Column, Field, Relationship, String

from app.core.models.base_sql_model import SparSQLModel

if TYPE_CHECKING:
    from ....spar.modules.models import Module


class PromptConsiderationBase(SparSQLModel):
    consideration: Optional[str] = Field(max_length=500, sa_column=Column(String(500)))
    module_id: Optional[int] = Field(default=None, foreign_key="module.id")


class PromptConsideration(PromptConsiderationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    module: Optional["Module"] = Relationship(back_populates="promptconsiderations")


class PromptConsiderationCreate(PromptConsiderationBase):
    pass


class PromptConsiderationRead(PromptConsiderationBase):
    id: int
