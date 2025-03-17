from datetime import datetime

from app.core.dependencies import DBSessionDep
from app.infra.processes.llm_start import start_llm_server
from app.infra.processes.llm_stop import stop_llm_server
from ..models.azure_instance import (
    LLMInstanceStatus,
    LLMInstance,
    LLMInstanceUpdate,
    LLMInstanceCreate,
)
from ..service import (
    update_instance_details,
    read_all_instances,
    read_an_instance,
    create_an_instance,
)
from ..config import get_instance_config
from .base import get_db_objects
# from ..schemas import SparBaseSchemaModel


# region HELPER FUNCTIONS
############# HELPER FUNCTIONS ##############


def update_instance_state(
    db, instance, success_state, failed_state=None, return_code=None, logs=None
):
    if success_state and failed_state:
        status = success_state if return_code == 0 else failed_state
        instance_updates = LLMInstanceUpdate(
            status=status, last_edited=datetime.utcnow(), logs="\n".join(logs)
        )
    else:
        status = success_state
        instance_updates = LLMInstanceUpdate(
            status=status, last_edited=datetime.utcnow()
        )
    update_instance_details(
        db=db, instance_to_update=instance, instance_updates=instance_updates
    )


#############################################
# endregion

# region DB FUNCTIONS
################ DB FUNCTIONS ###############


def get_all_llm_instances_controller(db: DBSessionDep):
    return read_all_instances(db=db, instance_model=LLMInstance)


# user: NormalUserDep
def get_llm_instance_controller(
    db: DBSessionDep, instance_id: int = get_instance_config().llm_instance_id
):
    return read_an_instance(db=db, instance_id=instance_id, instance_model=LLMInstance)


def is_llm_instance_ready(db: DBSessionDep):
    instance = get_llm_instance_controller(db=db)
    if instance and instance.status == LLMInstanceStatus.READY:
        return True
    else:
        return False


def create_llm_instance_controller(db: DBSessionDep, payload: LLMInstanceCreate):
    # instance_data = {
    #     "server_name": "LLM instance",
    #     "provider": "azure",
    #     "region": "central-paris",
    # }
    return create_an_instance(
        db=db, instance_data=payload.model_dump(), instance_model=LLMInstance
    )


async def start_llm_if_not_already_controller(
    db: DBSessionDep, user_id: int, llm: LLMInstance
):
    if llm and llm.status != LLMInstanceStatus.READY:
        vars = {
            "azure_resource_group": llm.azure_resource_group,
            "azure_vm_name": llm.azure_vm_name,
            "azure_subscription_id": llm.azure_subscription_id,
            "azure_tenant": llm.azure_tenant,
        }
        await start_llm_server_controller(
            db=db,
            user_id=user_id,
            extra_vars=vars,
            inventory=f"{llm.server_public_ip},",
        )


#############################################
# endregion

# region LLM ANSIBLE SCRIPTS
############ LLM ANSIBLE SCRIPTS ############


async def start_llm_server_controller(
    db: DBSessionDep,
    user_id: int,
    extra_vars: dict,
    inventory: str,
    instance_id: int = get_instance_config().llm_instance_id,
):
    try:
        user, instance = get_db_objects(
            db=db, user_id=user_id, instance_id=instance_id, instance_model=LLMInstance
        )

        update_instance_state(db, instance, LLMInstanceStatus.STARTING)
        return_code, output, logs = await start_llm_server(
            extra_vars=extra_vars, inventory=inventory
        )
        update_instance_state(
            db,
            instance,
            LLMInstanceStatus.READY,
            LLMInstanceStatus.FAILED,
            return_code,
            logs,
        )

    except Exception as e:
        raise e


async def stop_llm_server_controller(
    db: DBSessionDep, user_id: int, instance_id: int, extra_vars: dict
):
    try:
        user, instance = get_db_objects(
            db=db, user_id=user_id, instance_id=instance_id, instance_model=LLMInstance
        )

        update_instance_state(db, instance, LLMInstanceStatus.TERMINATING)
        return_code, output, logs = await stop_llm_server(extra_vars=extra_vars)
        update_instance_state(
            db,
            instance,
            LLMInstanceStatus.TERMINATED,
            LLMInstanceStatus.TERMINATION_FAILED,
            return_code,
            logs,
        )

    except Exception as e:
        raise e


#############################################
# endregion
