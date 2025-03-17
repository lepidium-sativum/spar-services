from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import JSON, Column, String
from sqlmodel import Field, Relationship

from app.core.models.base_sql_model import SparSQLModel

from ...spar.models_linking import ClientModuleLink

if TYPE_CHECKING:
    from ...spar.modules.models import Module
    from ...spar.users.models import User

from ...spar.users.models import UserResponse


class ClientConfig:
    json_schema_extra = {}


# TODO:
# last_connection TIMESTAMP DEFAULT CURRENT_TIMESTAMP
class ClientBase(SparSQLModel, ClientConfig):
    name: Optional[str] = Field(
        max_length=100, sa_column=Column(String(100), nullable=False, unique=True)
    )  # For internal use. Use 'client company' to refer to name visible to the client
    company: Optional[str] = Field(max_length=100, sa_column=Column(String(100)))
    domain: str = Field(max_length=255, sa_column=Column(String(255)))
    description: Optional[str] = Field(max_length=255, sa_column=Column(String(255)))
    email: str = Field(max_length=100, sa_column=Column(String(100)))
    site_url: str = Field(max_length=255, sa_column=Column(String(255)))
    locations: dict = Field(sa_column=Column(JSON))
    raw_files: dict | None = Field(sa_column=Column(JSON))

    class Config:
        extra = "forbid"
        json_schema_extra = ClientConfig.json_schema_extra


class Client(ClientBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    users: List["User"] = Relationship(back_populates="client")
    modules: List["Module"] = Relationship(back_populates="clients", link_model=ClientModuleLink)


class ClientCreate(ClientBase):
    pass


class ClientRead(ClientBase):
    id: int
    users: List["User"] = Relationship(back_populates="client")
    modules: List["Module"] = Relationship(back_populates="client")


class ClientResponse(SparSQLModel):
    id: int
    name: str
    company: str
    locations: dict
    users: List[UserResponse]

    class Config:
        from_attributes = True


class ClientUpdate(ClientBase, ClientConfig):
    pass

    class Config:
        extra = "forbid"
        json_schema_extra = ClientConfig.json_schema_extra


class ClientDelete(SparSQLModel):
    id: int


class ClientsReadAll(SparSQLModel):
    clients: List[ClientRead]
