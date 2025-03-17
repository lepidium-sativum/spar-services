from app.aws.controller import get_mh_download_signed_url_controller, get_mh_upload_signed_url_controller
from app.core.dependencies import DBSessionDep

from .models import MetaHumanBase, MetaHumanCreate
from .service import create_a_metahuman, delete_a_metahuman, read_a_metahuman, read_all_metahumans


def create_metahuman_controller(db: DBSessionDep, mh: MetaHumanCreate):
    return create_a_metahuman(db=db, mh=mh)


def get_all_metahumans_controller(db: DBSessionDep):
    metahumans = read_all_metahumans(db=db)
    for mh in metahumans:
        image_url = get_mh_download_signed_url_controller(file_key=f"{mh.image_id}.png")
        mh.url = image_url
    return metahumans


def get_a_metahuman_controller(db: DBSessionDep, mh_id: int):
    return read_a_metahuman(db=db, mh_id=mh_id)


def delete_metahuman_controller(db: DBSessionDep, mh_id: int):
    return delete_a_metahuman(db=db, mh_id=mh_id)


def get_upload_url_controller(db: DBSessionDep):
    image_id = MetaHumanBase.generate_uuid()
    # TODO: Instead of hard coded "png", get the mimeType from FE.
    image_url = get_mh_upload_signed_url_controller(file_key=f"{image_id}.png")
    return {"image_id": image_id, "image_url": image_url}
