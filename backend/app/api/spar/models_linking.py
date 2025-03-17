from sqlmodel import Field, Relationship, UniqueConstraint
from typing import Optional, TYPE_CHECKING


from app.core.models.base_sql_model import SparSQLModel

if TYPE_CHECKING:
    from .modules.models import Module
    from .users.models import User


class UserModuleLink(SparSQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")  # unique=True, primary_key=True
    module_id: int = Field(foreign_key="module.id")  # unique=True
    user: "User" = Relationship(back_populates="module_links")
    module: "Module" = Relationship(back_populates="user_links")
    is_completed: bool | None = None
    # https://sqlmodel.tiangolo.com/tutorial/many-to-many/link-with-extra-fields/#create-relationships
    rating: Optional[int] = Field(default=None)
    __table_args__ = (
        UniqueConstraint("user_id", "module_id", name="unique_user_module"),
    )


class ClientModuleLink(SparSQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    client_id: int = Field(foreign_key="client.id")
    module_id: int = Field(foreign_key="module.id")  # unique=True
    __table_args__ = (
        UniqueConstraint("client_id", "module_id", name="unique_client_module"),
    )


class ModuleObjectiveLink(SparSQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    module_id: Optional[int] = Field(default=None, foreign_key="module.id")
    objective_id: Optional[int] = Field(default=None, foreign_key="objective.id")


class ModulePromptConsiderationLink(SparSQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    module_id: Optional[int] = Field(default=None, foreign_key="module.id")
    promptconsideration_id: Optional[int] = Field(
        default=None, foreign_key="promptconsideration.id"
    )
