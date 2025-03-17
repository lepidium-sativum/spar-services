from app.core.dependencies import DBSessionDep
from .models import ClientCreate, ClientUpdate
from .service import (
    create_a_client,
    read_clients,
    read_all_clients_users,
    read_client_modules,
    read_a_client,
    update_a_client,
    read_a_client_users,
    # read_a_client_objectives,
    delete_a_client,
)


def create_client_controller(db: DBSessionDep, client: ClientCreate):
    return create_a_client(db=db, client=client)


def get_clients_controller(db: DBSessionDep, offset: int, limit: int):
    return read_clients(db=db, offset=offset, limit=limit)


def get_all_clients_users_controller(db: DBSessionDep, offset: int, limit: int):
    return read_all_clients_users(db=db, offset=offset, limit=limit)


def get_client_modules_controller(
    db: DBSessionDep, client_id: int, offset: int, limit: int
):
    return read_client_modules(db=db, client_id=client_id, offset=offset, limit=limit)


def get_client_controller(db: DBSessionDep, client_id: int):
    return read_a_client(db=db, client_id=client_id)


def update_client_controller(db: DBSessionDep, client_id: int, client: ClientUpdate):
    return update_a_client(db=db, client_id=client_id, client=client)


def get_client_users_controller(db: DBSessionDep, client_id: int):
    return read_a_client_users(db=db, client_id=client_id)


# def get_client_objectives_controller(db: DBSessionDep, client_id: int):
#     return read_a_client_objectives(db=db, client_id=client_id)


def delete_client_controller(db: DBSessionDep, client_id: int):
    return delete_a_client(db=db, client_id=client_id)
