from fastapi import APIRouter, Query

from app.core.dependencies import DBSessionDep
from .controller import (
    create_client_controller,
    get_clients_controller,
    get_all_clients_users_controller,
    get_client_modules_controller,
    get_client_controller,
    update_client_controller,
    get_client_users_controller,
    delete_client_controller,
)
from .models import ClientRead, ClientCreate, ClientUpdate, ClientResponse
from app.api.spar.users.models import UserRead


router = APIRouter()


@router.post("", response_model=ClientRead)
def create_client(db: DBSessionDep, client: ClientCreate):
    """
    Create a client.
    """
    return create_client_controller(db=db, client=client)


@router.get("", response_model=list[ClientRead])
def get_clients(db: DBSessionDep, offset: int = 0, limit: int = Query(default=1000, lte=1000)):
    return get_clients_controller(db=db, offset=offset, limit=limit)


@router.get("/users", response_model=list[ClientResponse])
def get_all_clients_users(db: DBSessionDep, offset: int = 0, limit: int = Query(default=1000, lte=1000)):
    return get_all_clients_users_controller(db=db, offset=offset, limit=limit)


@router.get("/{client_id}/modules")  # response_model=list[ClientResponse])
def get_client_modules(
    db: DBSessionDep,
    client_id: int,
    offset: int = 0,
    limit: int = Query(default=1000, lte=1000),
):
    return get_client_modules_controller(db=db, client_id=client_id, offset=offset, limit=limit)


@router.get("/{client_id}", response_model=ClientRead)  # response_model=List[UserRead]
def get_client(db: DBSessionDep, client_id: int):
    return get_client_controller(db=db, client_id=client_id)


@router.patch("/{client_id}", response_model=ClientRead)
def update_client(db: DBSessionDep, client_id: int, client: ClientUpdate):
    return update_client_controller(db=db, client_id=client_id, client=client)


@router.get("/{client_id}/users", response_model=list[UserRead])
def get_client_users(db: DBSessionDep, client_id: int):
    return get_client_users_controller(db=db, client_id=client_id)


@router.delete("/{client_id}")
def delete_a_client(db: DBSessionDep, client_id: int):
    """
    Delete a client.
    """
    return delete_client_controller(db=db, client_id=client_id)
