from fastapi.encoders import jsonable_encoder
from sqlalchemy.exc import IntegrityError
from sqlmodel import desc, select

from app.aws.controller import get_bg_image_download_signed_url_controller
from app.core.dependencies import DBSessionDep
from app.core.exceptions import DetailedHTTPException
from app.core.logger import logger

from .exceptions import SceneAlreadyExists, SceneNotFound
from .models import BackgroundImage, BGScene, BGSceneCreate


def create_a_scene(db: DBSessionDep, scene: BGSceneCreate):
    try:
        scene_data = jsonable_encoder(scene)
        obj_to_db = BGScene(**scene_data)
        # obj_to_db = BGScene.model_validate(scene_data)
        db.add(obj_to_db)
        db.commit()
        db.refresh(obj_to_db)
        return obj_to_db
    except IntegrityError as e:
        logger.exception(e)
        db.rollback()
        raise SceneAlreadyExists()
    except Exception as e:
        logger.exception(e)
        raise DetailedHTTPException()


def read_all_scenes(db: DBSessionDep):
    scenes = db.exec(select(BGScene).order_by(desc(BGScene.created_at))).all()
    return scenes


def read_all_scenes_with_signed_urls(db: DBSessionDep):
    scenes = db.exec(select(BGScene).order_by(desc(BGScene.created_at))).all()
    for scene in scenes:
        # if isinstance(scene.background_image, dict):
        scene.background_image = BackgroundImage.from_dict(scene.background_image)
        image_url = get_bg_image_download_signed_url_controller(file_key=f"{scene.background_image.image_id}.png")
        scene.background_image.url = image_url
    return scenes


def read_a_scene(db: DBSessionDep, scene_id: int):
    scene = db.get(BGScene, scene_id)
    if not scene:
        raise SceneNotFound(original_error=str(scene_id))
    return scene


def delete_a_scene(db: DBSessionDep, scene_id: int):
    scene = db.get(BGScene, scene_id)
    if not scene:
        raise SceneNotFound()
    db.delete(scene)
    db.commit()
    return {"ok": True}
