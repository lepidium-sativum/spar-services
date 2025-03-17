from datetime import datetime

from sqlalchemy import MetaData
from sqlmodel import Field, SQLModel

# Below taken from a nice recent article on best practices for Alembic and SQLAlchemy
# https://medium.com/@pavel.loginov.dev/best-practices-for-alembic-and-sqlalchemy-73e4c8a6c205
convention = {
    "all_column_names": lambda constraint, table: "_".join([column.name for column in constraint.columns.values()]),
    "ix": "ix__%(table_name)s__%(all_column_names)s",
    "uq": "uq__%(table_name)s__%(all_column_names)s",
    "ck": "ck__%(table_name)s__%(constraint_name)s",
    "fk": "fk__%(table_name)s__%(all_column_names)s__%(referred_table_name)s",
    "pk": "pk__%(table_name)s",
}


class SparSQLModel(SQLModel):
    metadata = MetaData(naming_convention=convention)
    # https://ulid.page
    # https://fastapi-utils.davidmontague.xyz/user-guide/basics/guid-type/

    # TODO: User can provide the created_at and last_edited fields. Restrict them
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    # https://jacob-t-graham.com/2024/03/01/how-to-make-auto-updating-timestamp-fields-in-sqlmodel/
    last_edited: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )
