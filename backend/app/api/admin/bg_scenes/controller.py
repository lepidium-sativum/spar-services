from app.core.dependencies import DBSessionDep
from .models import BGSceneCreate, BGSceneBase
from .service import create_a_scene, read_a_scene, delete_a_scene, read_all_scenes_with_signed_urls
from app.aws.controller import get_bg_image_upload_signed_url_controller


def create_scene_controller(db: DBSessionDep, scene: BGSceneCreate):
    return create_a_scene(db=db, scene=scene)


def get_all_scenes_controller(db: DBSessionDep):
    scenes = read_all_scenes_with_signed_urls(db=db)
    return scenes


def get_a_scene_controller(db: DBSessionDep, scene_id: int):
    return read_a_scene(db=db, scene_id=scene_id)


def delete_scene_controller(db: DBSessionDep, scene_id: int):
    return delete_a_scene(db=db, scene_id=scene_id)


def get_upload_url_controller(db: DBSessionDep):
    image_id = BGSceneBase.generate_uuid()
    # TODO: Instead of hard coded "png", get the mimeType from FE.
    image_url = get_bg_image_upload_signed_url_controller(file_key=f"{image_id}.png")
    return {"image_id": image_id, "image_url": image_url}
