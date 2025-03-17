from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from sqlmodel import desc, select

from app.api.spar.modules.models import Module
from app.core.dependencies import DBSessionDep
from app.core.exceptions import DetailedHTTPException
from app.core.logger import logger
from app.core.util import recursive_vars

from .exceptions import ClientAlreadyExists, ClientNotFound
from .models import Client, ClientCreate, ClientResponse, ClientUpdate


# TODO: Check if the client already exists
def create_a_client(db: DBSessionDep, client: ClientCreate):
    try:
        client_to_db = Client.model_validate(client)
        db.add(client_to_db)
        db.commit()
        db.refresh(client_to_db)
        return client_to_db
    except IntegrityError as e:
        logger.exception(e)
        db.rollback()
        raise ClientAlreadyExists()
    except Exception as e:
        logger.exception(e)
        raise DetailedHTTPException()


def read_clients(db: DBSessionDep, offset: int, limit: int):
    clients = db.exec(select(Client).offset(offset).limit(limit).order_by(desc(Client.created_at))).all()
    return clients


def read_all_clients_users(db: DBSessionDep, offset: int, limit: int):
    clients_users = db.exec(
        select(Client)
        .options(
            selectinload(Client.users),
        )
        .offset(offset)
        .limit(limit)
        .order_by(desc(Client.created_at))
    ).all()
    return [ClientResponse.model_validate(client_users) for client_users in clients_users]


def read_client_modules(db: DBSessionDep, client_id: int, offset: int, limit: int):
    clients_modules = db.exec(
        select(Client)
        .options(selectinload(Client.modules).selectinload(Module.objectives))
        .where(Client.id == client_id)
        .offset(offset)
        .limit(limit)
        .order_by(desc(Client.created_at))
    ).all()
    serialized_client_modules = recursive_vars(clients_modules)
    return serialized_client_modules


def read_a_client(db: DBSessionDep, client_id: int):
    client = db.get(Client, client_id)
    if not client:
        raise ClientNotFound(original_error=str(client_id))
    return client


def read_a_client_users(db: DBSessionDep, client_id: int):
    client = db.get(Client, client_id)
    if not client:
        raise ClientNotFound(original_error=str(client_id))
    return client.users


def delete_a_client(db: DBSessionDep, client_id: int):
    client = db.get(Client, client_id)
    if not client:
        raise ClientNotFound()
    db.delete(client)
    db.commit()
    return {"ok": True}


def update_a_client(db: DBSessionDep, client_id: int, client: ClientUpdate):
    client_to_update = db.get(Client, client_id)
    if not client_to_update:
        raise ClientNotFound()

    client_to_db = Client.model_validate(client)
    client_data = client_to_db.model_dump(exclude_unset=True)
    for key, value in client_data.items():
        setattr(client_to_update, key, value)

    db.add(client_to_update)
    db.commit()
    db.refresh(client_to_update)
    return client_to_update
