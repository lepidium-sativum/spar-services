from fastapi import APIRouter
from typing import List
from app.core.dependencies import DBSessionDep

from .controller import (
    create_metahuman_controller,
    get_all_metahumans_controller,
    get_a_metahuman_controller,
    delete_metahuman_controller,
    get_upload_url_controller,
)

from .models import MetaHumanRead, MetaHumanCreate

router = APIRouter()


@router.post("", response_model=MetaHumanRead)
def create_metahuman(db: DBSessionDep, mh: MetaHumanCreate):
    """
    Create a new Metahuman.
    """
    return create_metahuman_controller(db=db, mh=mh)


@router.get("", response_model=List[MetaHumanRead])
def get_all_metahumans(db: DBSessionDep):
    """
    Get all metahumans.
    """
    return get_all_metahumans_controller(db=db)


@router.get("/{mh_id}", response_model=MetaHumanRead)
def get_a_metahuman(db: DBSessionDep, mh_id: int):
    """
    Get a specific metahuman
    """
    return get_a_metahuman_controller(db=db, mh_id=mh_id)


@router.delete("/{mh_id}")
def delete_a_metahuman(db: DBSessionDep, mh_id: int):
    """
    Delete a Metahuman.
    """
    return delete_metahuman_controller(db=db, mh_id=mh_id)


@router.get("/media/upload")  # response_model=url
def get_upload_url(db: DBSessionDep):
    """
    Get the signed URL required to upload the Metahuman image.
    """
    return get_upload_url_controller(db=db)
