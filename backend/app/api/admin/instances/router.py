from fastapi import APIRouter, BackgroundTasks

from app.api.auth.dependencies import NormalUserDep
from app.core.dependencies import DBSessionDep

from app.api.spar.instances.controllers.aws import (
    get_all_ue_instances_controller,
    get_ue_instance_controller,
    create_ue_instance_controller,
    acquire_an_instance_controller,
    terminate_an_instance_controller,
    spin_up_ue_instance_and_app_controller,
    spin_down_ue_instance_controller,
    spin_up_ue_instance_controller,
    start_ue_application_controller,
    stop_ue_application_controller,
)
from app.api.spar.instances.controllers.azure import (
    get_all_llm_instances_controller,
    get_llm_instance_controller,
    create_llm_instance_controller,
    start_llm_server_controller,
    stop_llm_server_controller,
)


# from .dependencies import ValidUserOwnedOrAdminSparDep, ValidUserOwnedSparDep
from app.api.spar.instances.models.aws_instance import UEInstanceRead

from app.api.spar.instances.models.azure_instance import (
    LLMInstanceCreate,
    LLMInstanceRead,
)
from app.api.spar.instances.schemas import (
    AcquireInstance,
    TerminateInstance,
    StartUEApp,
    StopUEApp,
    SpinUpUEAndAppInstance,
    SpinUpUEInstance,
    SpinDownUEInstance,
    StartLLMServer,
    StopLLMServer,
)


router = APIRouter()


# region DB FUNCTIONS
############### DB FUNCTIONS ################


@router.get("/ue", response_model=list[UEInstanceRead])
def get_all_ue_instances(db: DBSessionDep, user: NormalUserDep):
    """
    Get all UE instances
    """
    return get_all_ue_instances_controller(db=db)


@router.get("/ue/{instance_id}", response_model=UEInstanceRead)
def get_ue_instance(db: DBSessionDep, user: NormalUserDep, instance_id: int):
    """
    Retrieve a UE instance details
    """
    return get_ue_instance_controller(db=db, instance_id=instance_id)


@router.get("/llm", response_model=list[LLMInstanceRead])
def get_all_llm_instances(db: DBSessionDep, user: NormalUserDep):
    """
    Get all LLM instances
    """
    return get_all_llm_instances_controller(db=db)


@router.get("/llm/{instance_id}", response_model=LLMInstanceRead)
def get_llm_instance(db: DBSessionDep, user: NormalUserDep, instance_id: int):
    """
    Retrieve an LLM instance details
    """
    return get_llm_instance_controller(db=db, instance_id=instance_id)


@router.post("/llm")  # response_model=LLMInstanceRead
def create_LLM_instance(
    db: DBSessionDep,
    user: NormalUserDep,
    payload: LLMInstanceCreate,
):
    """
    Create a new LLM instance
    """
    instance_created = create_llm_instance_controller(db=db, payload=payload)
    return instance_created


#############################################
# endregion


# region UE ANSIBLE SCRIPTS
############ UE ANSIBLE SCRIPTS #############


@router.post("/ue/acquire")  # response_model=UEInstanceCreate
async def acquire_an_instance(
    db: DBSessionDep,
    user: NormalUserDep,
    payload: AcquireInstance,
    background_tasks: BackgroundTasks,
):
    """
    Acquire a new instance in background
    """

    instance_created = create_ue_instance_controller(db=db)
    background_tasks.add_task(
        acquire_an_instance_controller,
        db=db,
        user_id=user.id,
        instance_id=instance_created.id,
        extra_vars=payload.model_dump(),
    )
    return instance_created


@router.post("/ue/terminate")  # response_model=UEInstanceCreate
async def terminate_an_instance(
    db: DBSessionDep,
    user: NormalUserDep,
    payload: TerminateInstance,
    background_tasks: BackgroundTasks,
):
    """
    Terminate an instance in background
    """
    background_tasks.add_task(
        terminate_an_instance_controller,
        db=db,
        user_id=user.id,
        instance_id=payload.instance_id,
    )
    return payload.instance_id


@router.post("/ue/app/spinup")
async def spin_up_ue_instance_and_app(
    db: DBSessionDep,
    user: NormalUserDep,
    payload: SpinUpUEAndAppInstance,
    background_tasks: BackgroundTasks,
):
    """
    Spin up UE instance and App in background
    """
    # instance = get_instance_controller(db=db)
    background_tasks.add_task(
        spin_up_ue_instance_and_app_controller,
        db=db,
        user_id=user.id,
        instance_id=payload.instance_id,
        extra_vars=payload.vars.model_dump(),
        inventory=payload.inventory,  # server_public_ip = inventory
    )
    return payload


@router.post("/ue/spindown")
async def spin_down_ue_instance(
    db: DBSessionDep,
    user: NormalUserDep,
    payload: SpinDownUEInstance,
    background_tasks: BackgroundTasks,
):
    """
    Spin down UE instance in background
    """
    # instance = get_instance_controller(db=db)
    background_tasks.add_task(
        spin_down_ue_instance_controller,
        db=db,
        user_id=user.id,
        instance_id=payload.instance_id,
        extra_vars=payload.vars.model_dump(),
    )
    return payload


@router.post("/ue/spinup")
async def spin_up_ue_instance(
    db: DBSessionDep,
    user: NormalUserDep,
    payload: SpinUpUEInstance,
    background_tasks: BackgroundTasks,
):
    """
    Spin up UE instance in background
    """
    # instance = get_instance_controller(db=db)
    background_tasks.add_task(
        spin_up_ue_instance_controller,
        db=db,
        user_id=user.id,
        instance_id=payload.instance_id,
        extra_vars=payload.vars.model_dump(),
    )
    return payload


@router.post("/ue/app/start")
async def start_ue_application(
    db: DBSessionDep,
    user: NormalUserDep,
    payload: StartUEApp,
    background_tasks: BackgroundTasks,
):
    """
    Start UE App in background
    """
    # instance = get_instance_controller(db=db)
    background_tasks.add_task(
        start_ue_application_controller,
        db=db,
        user_id=user.id,
        instance_id=payload.instance_id,
        extra_vars=payload.vars.model_dump(),
        inventory=payload.inventory,
    )
    return payload


@router.post("/ue/app/stop")
async def stop_ue_application(
    db: DBSessionDep,
    user: NormalUserDep,
    payload: StopUEApp,
    background_tasks: BackgroundTasks,
):
    """
    Stop UE App in background
    """
    # instance = get_instance_controller(db=db)
    background_tasks.add_task(
        stop_ue_application_controller,
        db=db,
        user_id=user.id,
        instance_id=payload.instance_id,
        extra_vars=payload.vars.model_dump(),
        inventory=payload.inventory,
    )
    return payload


#############################################
# endregion


# region LLM ANSIBLE SCRIPTS
############ LLM ANSIBLE SCRIPTS ############


@router.post("/llm/start")
async def start_llm_server(
    db: DBSessionDep,
    user: NormalUserDep,
    payload: StartLLMServer,
    background_tasks: BackgroundTasks,
):
    """
    Start LLM server in background
    """
    background_tasks.add_task(
        start_llm_server_controller,
        db=db,
        user_id=user.id,
        extra_vars=payload.vars.model_dump(),
        inventory=payload.inventory,
        instance_id=payload.instance_id,
    )
    return payload


@router.post("/llm/stop")
async def stop_llm_server(
    db: DBSessionDep,
    user: NormalUserDep,
    payload: StopLLMServer,
    background_tasks: BackgroundTasks,
):
    """
    Stop LLM server in background
    """
    background_tasks.add_task(
        stop_llm_server_controller,
        db=db,
        user_id=user.id,
        instance_id=payload.instance_id,
        extra_vars=payload.vars.model_dump(),
    )
    return payload


#############################################
# endregion
