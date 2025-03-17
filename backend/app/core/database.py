from sqlmodel import Session, create_engine  # MetaData

from app.core.models.base_sql_model import SparSQLModel
from app.core.config import get_base_config


engine = create_engine(str(get_base_config().sqlalchemy_db_uri), echo=False)


def get_session():
    with Session(engine) as session:
        yield session


def close_db_engine():
    engine.dispose()
