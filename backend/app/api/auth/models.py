from sqlmodel import Field, Column, String
from pydantic import BaseModel

# from sqlalchemy.dialects.postgresql import UUID
from app.core.models.base_sql_model import SparSQLModel


class UserLogin(SparSQLModel):
    username: str = Field(max_length=30, sa_column=Column(String(30), nullable=False, unique=True))
    password: str = Field(max_length=60, sa_column=Column(String(60), nullable=False))


class AccessTokenResponse(BaseModel):
    access_token: str | None = None
    refresh_token: str | None = None
