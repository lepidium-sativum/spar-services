from sqlmodel import select  # desc, SQLModel
from typing import Union
from sqlalchemy.exc import IntegrityError
from app.core.dependencies import DBSessionDep
from app.core.exceptions import DetailedHTTPException
from app.core.logger import logger
from .exceptions import InstanceNotFound, InstanceAlreadyExists

from .models.instance_base import InstanceBase, InstanceUpdate
from .models.aws_instance import UEInstance  # UEInstanceUpdate  # UEInstanceCreate
from .models.azure_instance import LLMInstance


# TODO: Check if the instance already  exists
def create_an_instance(
    db: DBSessionDep, instance_data: dict, instance_model: InstanceBase
):
    try:
        instance = instance_model(**instance_data)
        instance_to_db = instance_model.model_validate(instance)
        db.add(instance_to_db)
        db.commit()
        db.refresh(instance_to_db)
        return instance_to_db
    except IntegrityError as e:
        logger.exception(e)
        db.rollback()
        raise InstanceAlreadyExists()
    except Exception as e:
        logger.exception(e)
        raise DetailedHTTPException()


def read_all_instances(
    db: DBSessionDep,
    instance_model: Union[UEInstance, LLMInstance],
    instance_status: str = None,
) -> list[UEInstance, LLMInstance]:
    query = select(instance_model)
    if instance_status:
        query = query.filter(instance_model.status == instance_status)
    instances = db.exec(query).all()
    return instances


def read_an_instance(
    db: DBSessionDep, instance_id: int, instance_model: Union[UEInstance, LLMInstance]
) -> Union[UEInstance, LLMInstance]:
    instance = db.get(instance_model, instance_id)
    if not instance:
        raise InstanceNotFound(original_error=str(instance_id))
    return instance


def update_instance_details(
    db: DBSessionDep,
    instance_to_update: InstanceBase,
    instance_updates: InstanceUpdate,
):
    instance_data = instance_updates.model_dump(exclude_unset=True)
    for key, value in instance_data.items():
        setattr(instance_to_update, key, value)

    db.add(instance_to_update)
    db.commit()
    db.refresh(instance_to_update)
    return instance_to_update


def delete_an_instance(
    db: DBSessionDep, instance_id: int, instance_model: InstanceBase
):
    instance = db.get(instance_model, instance_id)
    if not instance:
        raise InstanceNotFound()
    db.delete(instance)
    db.commit()
    return {"ok": True}
