from datetime import datetime
import asyncio
from app.core.dependencies import DBSessionDep

# from app.api.auth.dependencies import NormalUserDep
from .base import get_db_objects
from ..models.aws_instance import (
    # UEInstanceCreate,
    UEInstance,
    UEInstanceStatus,
    UEInstanceUpdate,
)

# from ..schemas import SparBaseSchemaModel
from ..service import (
    create_an_instance,
    read_all_instances,
    read_an_instance,
    update_instance_details,
)
from ..config import get_instance_config
from app.infra.processes.acquire_instance import acquire_an_instance
from app.infra.processes.terminate_instance import terminate_an_instance
from app.infra.processes.ue_instance_app_up import spin_up_both_ue_instance_and_app
from app.infra.processes.ue_instance_down import spin_down_ue_instance_only
from app.infra.processes.ue_instance_up import spin_up_ue_instance_only
from app.infra.processes.ue_app_start import start_ue_app_only
from app.infra.processes.ue_app_stop import stop_ue_app_only
from app.infra.processes.deploy_ue import deploy_ue_build


# region HELPER FUNCTIONS
############# HELPER FUNCTIONS ##############


def get_available_ue_instance_controller(db: DBSessionDep):
    instances = get_all_ue_available_instances_controller(db=db)
    if instances:
        return instances[0]
    else:
        return None


async def manage_standby_ue_instances_controller(
    db: DBSessionDep, user_id: int, tts_server: str
):
    available_instances = get_all_ue_available_instances_controller(db=db)
    available_instances_count = len(available_instances)
    no_of_standby_instances = get_instance_config().no_of_standby_ue_instances

    if available_instances_count == no_of_standby_instances:
        return
    if available_instances_count > no_of_standby_instances:
        extra_count = available_instances_count - no_of_standby_instances
        instances_to_terminate = available_instances[:extra_count]
        tasks = []
        for instance in instances_to_terminate:
            tasks.append(
                terminate_an_instance_controller(
                    db=db, user_id=user_id, instance_id=instance.id
                )
            )
            await asyncio.gather(*tasks)
    elif available_instances_count < no_of_standby_instances:
        missing_count = no_of_standby_instances - available_instances_count
        tasks = []
        for _ in range(missing_count):
            new_instance = create_ue_instance_controller(db=db)
            tasks.append(
                acquire_an_instance_controller(
                    db=db,
                    user_id=user_id,
                    instance_id=new_instance.id,
                    extra_vars={"server": tts_server, "region": new_instance.region},
                )
            )
            await asyncio.gather(*tasks)


def update_instance_state(
    db, instance, success_state, failed_state=None, return_code=None, logs=None
):
    if success_state and failed_state:
        status = success_state if return_code == 0 else failed_state
        instance_updates = UEInstanceUpdate(
            status=status, last_edited=datetime.utcnow(), logs="\n".join(logs)
        )
    else:
        status = success_state
        instance_updates = UEInstanceUpdate(
            status=status, last_edited=datetime.utcnow()
        )
    update_instance_details(
        db=db, instance_to_update=instance, instance_updates=instance_updates
    )


#############################################
# endregion

# region DB FUNCTIONS
################ DB FUNCTIONS ###############


# user: NormalUserDep, offset: int, limit: int
def get_all_ue_instances_controller(db: DBSessionDep):
    return read_all_instances(db=db, instance_model=UEInstance)


def get_all_ue_available_instances_controller(db: DBSessionDep):
    # TODO: AVAILABLE or STARTED
    return read_all_instances(
        db=db, instance_model=UEInstance, instance_status=UEInstanceStatus.AVAILABLE
    )


# user: NormalUserDep
def get_ue_instance_controller(db: DBSessionDep, instance_id: int):
    return read_an_instance(db=db, instance_id=instance_id, instance_model=UEInstance)


def is_ue_instance_ready(db: DBSessionDep, instance_id: int):
    instance = get_ue_instance_controller(db=db, instance_id=instance_id)
    if instance and instance.status == UEInstanceStatus.READY:
        return True
    else:
        return False


def create_ue_instance_controller(db: DBSessionDep):
    instance_data = {
        "server_name": UEInstance.generate_unique_server_name(),
        "provider": "aws",
        "region": "eu-west-3",
    }
    return create_an_instance(
        db=db, instance_data=instance_data, instance_model=UEInstance
    )


#############################################
# endregion

# region BASH SCRIPTS
################ BASH SCRIPTS ###############


async def acquire_an_instance_controller(
    db: DBSessionDep, user_id: int, instance_id: int, extra_vars: dict
):
    user, instance = get_db_objects(
        db=db, user_id=user_id, instance_id=instance_id, instance_model=UEInstance
    )
    update_instance_state(db, instance, UEInstanceStatus.CREATING)
    return_code, output, logs = await acquire_an_instance(
        workspace_id=instance.server_name,
        server=extra_vars["server"],
        region=extra_vars["region"],
    )
    if return_code == 0:
        instance_updates = UEInstanceUpdate(
            status=UEInstanceStatus.AVAILABLE,
            last_edited=datetime.utcnow(),
            **output,
            logs="\n".join(logs),
        )
    else:
        instance_updates = UEInstanceUpdate(
            status=UEInstanceStatus.FAILED,
            last_edited=datetime.utcnow(),
            logs="\n".join(logs),
        )
    update_instance_details(
        db=db, instance_to_update=instance, instance_updates=instance_updates
    )


async def terminate_an_instance_controller(
    db: DBSessionDep, user_id: int, instance_id: int
):
    user, instance = get_db_objects(
        db=db, user_id=user_id, instance_id=instance_id, instance_model=UEInstance
    )

    update_instance_state(db, instance, UEInstanceStatus.TERMINATING)
    workspace_id = instance.server_name
    return_code, output, logs = await terminate_an_instance(workspace_id=workspace_id)
    update_instance_state(
        db,
        instance,
        UEInstanceStatus.TERMINATED,
        UEInstanceStatus.TERMINATION_FAILED,
        return_code,
        logs,
    )


#############################################
# endregion


# region UE ANSIBLE SCRIPTS
############ UE ANSIBLE SCRIPTS #############


async def spin_up_ue_instance_and_app_controller(
    db: DBSessionDep,
    user_id: int,
    extra_vars: dict,
    inventory: str,
    instance_id: int,
):
    try:
        user, instance = get_db_objects(
            db=db, user_id=user_id, instance_id=instance_id, instance_model=UEInstance
        )

        update_instance_state(db, instance, UEInstanceStatus.STARTING)
        return_code, output, logs = await spin_up_both_ue_instance_and_app(
            extra_vars=extra_vars, inventory=inventory
        )
        update_instance_state(
            db,
            instance,
            UEInstanceStatus.READY,
            UEInstanceStatus.FAILED,
            return_code,
            logs,
        )

    except Exception as e:
        raise e


async def spin_down_ue_instance_controller(
    db: DBSessionDep, user_id: int, instance_id: int, extra_vars: dict
):
    try:
        user, instance = get_db_objects(
            db=db, user_id=user_id, instance_id=instance_id, instance_model=UEInstance
        )

        update_instance_state(db, instance, UEInstanceStatus.STOPPING)
        return_code, output, logs = await spin_down_ue_instance_only(
            extra_vars=extra_vars, instance_id=instance_id
        )
        update_instance_state(
            db,
            instance,
            UEInstanceStatus.AVAILABLE,
            UEInstanceStatus.FAILED,
            return_code,
            logs,
        )

    except Exception as e:
        raise e


async def spin_up_ue_instance_controller(
    db: DBSessionDep, user_id: int, instance_id: int, extra_vars: dict
):
    try:
        user, instance = get_db_objects(
            db=db, user_id=user_id, instance_id=instance_id, instance_model=UEInstance
        )

        update_instance_state(db, instance, UEInstanceStatus.STARTING)
        return_code, output, logs = await spin_up_ue_instance_only(
            extra_vars=extra_vars, server_instance_id=instance.server_instance_id
        )
        update_instance_state(
            db,
            instance,
            UEInstanceStatus.STARTED,
            UEInstanceStatus.FAILED,
            return_code,
            logs,
        )

    except Exception as e:
        raise e


async def start_ue_application_controller(
    db: DBSessionDep,
    user_id: int,
    instance_id: int,
    extra_vars: dict,
    inventory: str,
):
    try:
        user, instance = get_db_objects(
            db=db, user_id=user_id, instance_id=instance_id, instance_model=UEInstance
        )

        update_instance_state(db, instance, UEInstanceStatus.STARTING_APP)
        return_code, output, logs = await start_ue_app_only(
            extra_vars=extra_vars, inventory=inventory
        )
        update_instance_state(
            db,
            instance,
            UEInstanceStatus.READY,
            UEInstanceStatus.FAILED,
            return_code,
            logs,
        )

    except Exception as e:
        raise e


async def stop_ue_application_controller(
    db: DBSessionDep,
    user_id: int,
    instance_id: int,
    extra_vars: dict,
    inventory: str,
):
    try:
        user, instance = get_db_objects(
            db=db, user_id=user_id, instance_id=instance_id, instance_model=UEInstance
        )

        update_instance_state(db, instance, UEInstanceStatus.STOPPING_APP)
        return_code, output, logs = await stop_ue_app_only(
            extra_vars=extra_vars, inventory=inventory
        )
        update_instance_state(
            db,
            instance,
            UEInstanceStatus.STARTED,
            UEInstanceStatus.FAILED,
            return_code,
            logs,
        )

    except Exception as e:
        raise e


#############################################
# endregion


# region UE DEPLOYMENT SCRIPTS
########### UE DEPLOYMENT SCRIPTS ###########


async def deploy_ue_build_controller(
    db: DBSessionDep, user_id: int, extra_vars: dict, s3_object_key: str
):
    try:
        # user, instance = get_db_objects(db=db, user_id=user_id, instance_id=instance_id, instance_model=UEInstance)
        # update_instance_state(db, instance, UEInstanceStatus.DEPLOYING)
        return_code, output, logs = await deploy_ue_build(
            extra_vars=extra_vars, s3_object_key=s3_object_key
        )
        # update_instance_state(
        #     db,
        #     instance,
        #     UEInstanceStatus.DEPLOYED,
        #     UEInstanceStatus.DEPLOYMENT_FAILED,
        #     return_code,
        #     logs,
        # )

    except Exception as e:
        raise e


#############################################
# endregion
