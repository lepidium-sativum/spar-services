from fastapi import APIRouter
from typing import List
from app.core.dependencies import DBSessionDep

from .controller import (
    create_scene_controller,
    get_all_scenes_controller,
    get_a_scene_controller,
    delete_scene_controller,
    get_upload_url_controller,
)

from .models import BGSceneRead, BGSceneCreate

router = APIRouter()


@router.post("", response_model=BGSceneRead)
def create_scene(db: DBSessionDep, scene: BGSceneCreate):
    """
    Create a new Background Scene.
    """
    return create_scene_controller(db=db, scene=scene)


@router.get("", response_model=List[BGSceneRead])
def get_all_scenes(db: DBSessionDep):
    """
    Get all scenes.
    """
    return get_all_scenes_controller(db=db)


@router.get("/{scene_id}", response_model=BGSceneRead)
def get_a_scene(db: DBSessionDep, scene_id: int):
    """
    Get a specific scene
    """
    return get_a_scene_controller(db=db, scene_id=scene_id)


@router.delete("/{scene_id}")
def delete_a_scene(db: DBSessionDep, scene_id: int):
    """
    Delete a scene.
    """
    return delete_scene_controller(db=db, scene_id=scene_id)


@router.get("/media/upload")  # response_model=url
def get_upload_url(db: DBSessionDep):
    """
    Get the signed URL required to upload the Background image.
    """
    return get_upload_url_controller(db=db)
