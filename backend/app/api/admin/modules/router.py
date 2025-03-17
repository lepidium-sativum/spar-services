from typing import Annotated
from fastapi import APIRouter, Body, Query

from app.core.dependencies import DBSessionDep
from app.api.spar.modules.dependencies import ValidModuleDep
from app.api.spar.modules.models import ModuleCreate, AssignModules, ModuleUpdate
from .controller import (
    create_module_controller,
    assign_modules_controller,
    get_modules_controller,
    get_module_spars_controller,
    get_user_modules_controller,
    get_user_module_spars_controller,
    get_module_controller,
    delete_module_controller,
    transform_prompt_to_new_format_controller,
    update_module_controller,
)
from app.api.llms.controller import get_prompt_template_controller

router = APIRouter()


@router.post("")  # response_model=ModuleRead
def create_module(db: DBSessionDep, module: ModuleCreate):
    """
    Create a module.
    """
    return create_module_controller(db=db, module=module)


@router.post("/assign")  # response_model=ModuleRead
def assign_modules(db: DBSessionDep, payload: AssignModules):
    """
    Assign modules to client and users.
    """
    return assign_modules_controller(db=db, payload=payload)


@router.get("", response_model=[])  # list[ModuleRead]
def get_modules(
    db: DBSessionDep,
    offset: int = 0,
    limit: int = Query(default=1000, lte=1000),
):
    return get_modules_controller(db=db, offset=offset, limit=limit)


@router.get("/{module_id}/spars")  # response_model=list[ClientResponse])
def get_module_spars(
    db: DBSessionDep,
    module_id: int,
    offset: int = 0,
    limit: int = Query(default=1000, lte=1000),
):
    return get_module_spars_controller(
        db=db, module_id=module_id, offset=offset, limit=limit
    )


@router.get("/users/{user_id}")  # response_model=list[ClientResponse])
def get_user_modules(
    db: DBSessionDep,
    user_id: int,
    offset: int = 0,
    limit: int = Query(default=1000, lte=1000),
):
    return get_user_modules_controller(
        db=db, user_id=user_id, offset=offset, limit=limit
    )


@router.get("/users/{user_id}/spars")  # response_model=list[ClientResponse])
def get_user_spars_grouped_by_module(
    db: DBSessionDep,
    user_id: int,
    offset: int = 0,
    limit: int = Query(default=1000, lte=1000),
):
    return get_user_module_spars_controller(
        db=db, user_id=user_id, offset=offset, limit=limit
    )


@router.get("/{module_id}")  # response_model=ModuleRead
def get_module(db: DBSessionDep, module_id: int):
    return get_module_controller(db=db, module_id=module_id)


@router.delete("/{module_id}")
def delete_a_module(db: DBSessionDep, module_id: int):
    """
    Delete a module.
    """
    return delete_module_controller(db=db, module_id=module_id)


@router.patch("/{module_id}")  # response_model=ModuleRead
def update_module(db: DBSessionDep, module_id: int, module: ModuleUpdate):
    return update_module_controller(db=db, module_id=module_id, module=module)


@router.get("/prompts/templates")  # response_class=PlainTextResponse
def get_prompt_template(db: DBSessionDep, template_name: str):
    """
    Get the prompt template given the name
    """
    return get_prompt_template_controller(template_name=template_name, filled=False)


@router.post("/prompts/transform-to-new-format")
async def transform_prompt_to_new_format(prompt: Annotated[str, Body()]):
    return await transform_prompt_to_new_format_controller(prompt=prompt)


@router.get("/{module_id}/prompts/transform-to-new-format")
async def transform_module_prompt_to_new_format(module: ValidModuleDep):
    return await transform_prompt_to_new_format_controller(prompt=module.system_prompt)
