from app.api.spar.modules.models import AssignModules, ModuleCreate, ModuleUpdate
from app.api.spar.modules.service import (
    assign_modules,
    create_a_module,
    delete_a_module,
    read_a_module_as_dict,
    read_all_module_spars,
    read_all_modules,
    read_user_module_spars,
    read_user_modules,
    update_a_module,
)
from app.core.dependencies import DBSessionDep

from .llm_calls import transform_prompt_to_new_format, stringify_scenario


def create_module_controller(db: DBSessionDep, module: ModuleCreate):
    return create_a_module(db=db, module=module)


def assign_modules_controller(db: DBSessionDep, payload: AssignModules):
    return assign_modules(db=db, payload=payload)


def get_modules_controller(db: DBSessionDep, offset: int, limit: int):
    return read_all_modules(db=db, offset=offset, limit=limit)


def get_module_spars_controller(
    db: DBSessionDep, module_id: int, offset: int, limit: int
):
    return read_all_module_spars(db=db, module_id=module_id, offset=offset, limit=limit)


def get_user_modules_controller(
    db: DBSessionDep, user_id: int, offset: int, limit: int
):
    return read_user_modules(
        db=db, user_id=user_id, offset=offset, limit=limit, module_as_dict=True
    )


def get_user_module_spars_controller(
    db: DBSessionDep, user_id: int, offset: int, limit: int
):
    return read_user_module_spars(db=db, user_id=user_id, offset=offset, limit=limit)


def get_module_controller(db: DBSessionDep, module_id: int):
    return read_a_module_as_dict(db=db, module_id=module_id)


def delete_module_controller(db: DBSessionDep, module_id: int):
    return delete_a_module(db=db, module_id=module_id)


def update_module_controller(db: DBSessionDep, module_id: int, module: ModuleUpdate):
    return update_a_module(db=db, module_id=module_id, module=module)


async def transform_prompt_to_new_format_controller(prompt: str):
    scenario = await transform_prompt_to_new_format(prompt=prompt)
    return stringify_scenario(scenario)
