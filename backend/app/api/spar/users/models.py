from enum import Enum
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Column, Field, Relationship, String, select

from app.core.dependencies import DBSessionDep
from app.core.models.base_sql_model import SparSQLModel

from ..models_linking import UserModuleLink

if TYPE_CHECKING:
    from ...admin.clients.models import Client
    from ..spars.models import Spar

from ..rooms_manager.models import Room


class UserRole(str, Enum):
    superadmin = "superadmin"
    admin = "admin"
    manager = "manager"
    user = "user"


class UserConfig:
    json_schema_extra = {
        "example": {
            "id": 1,
            "username": "test123",
            "first_name": "Super",
            "last_name": "man",
            "email": "johndoe@gmail.com",
            "role": "user",
            "lang": "en-US",
            "client_id": 3,
        }
    }


# TODO:
# last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
class UserBase(SparSQLModel, UserConfig):
    username: str = Field(
        max_length=55,
        sa_column=Column(String(55), nullable=False, unique=True, index=True),
    )
    first_name: str = Field(max_length=35, sa_column=Column(String(35)))
    last_name: str = Field(max_length=35, sa_column=Column(String(35)))
    email: str = Field(max_length=100, sa_column=Column(String(100), nullable=False, unique=True))
    lang: str | None = Field(
        default="en-US",
        max_length=6,
        sa_column=Column(String(6)),
        description="lang should be in this format en-US",
    )
    disabled: bool | None = None
    client_id: Optional[int] = Field(default=None, foreign_key="client.id")

    class Config:
        extra = "forbid"
        json_schema_extra = UserConfig.json_schema_extra


class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str = Field(max_length=60, sa_column=Column(String(60), nullable=False))
    role: UserRole = UserRole.user
    client: Optional["Client"] = Relationship(back_populates="users")
    spars: List["Spar"] = Relationship(back_populates="user")
    module_links: List["UserModuleLink"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    rooms: List["Room"] = Relationship(back_populates="user")

    @classmethod
    def get_by_username(cls, db: DBSessionDep, username: str) -> "User | None":
        user = db.exec(select(cls).where(cls.username == username)).first()
        return user


class UserCreate(UserBase):
    password: str = Field(max_length=100, sa_column=Column(String(100), nullable=False))

    class Config:
        extra = "forbid"


class UserRead(SparSQLModel):
    id: int
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    lang: str | None = None
    role: UserRole | None = None
    spars: List["Spar"] = Relationship(back_populates="user")
    module_links: List["UserModuleLink"] = Relationship(back_populates="user")


class UserUpdate(SparSQLModel):
    first_name: str | None = None
    last_name: str | None = None
    lang: str | None = None
    role: UserRole | None = None

    class Config:
        extra = "forbid"
        json_schema_extra = UserConfig.json_schema_extra


class UserResponse(SparSQLModel):
    id: int
    client_id: int
    first_name: str
    last_name: str
    username: str
    email: str

    class Config:
        from_attributes: True
