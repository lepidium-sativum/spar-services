from fastapi import APIRouter, Query

from app.api.spar.modules.models import ModuleLevel, UserModulesResponse, UserModulesSparsResponse

from app.core.dependencies import DBSessionDep
from app.api.auth.dependencies import NormalUserDep

from .controller import get_user_modules_controller, get_user_module_spars_controller

router = APIRouter()


@router.get("", response_model=list[UserModulesResponse])
def get_user_modules(
    db: DBSessionDep,
    user: NormalUserDep,
    offset: int = 0,
    limit: int = Query(default=1000, lte=1000),
    levels: list[ModuleLevel] | None = Query(default=None),
):
    return get_user_modules_controller(db=db, user=user, offset=offset, limit=limit, levels=levels)


@router.get("/spars", response_model=list[UserModulesSparsResponse])
def get_user_spars_grouped_by_module(
    db: DBSessionDep,
    user: NormalUserDep,
    offset: int = 0,
    limit: int = Query(default=1000, lte=1000),
    levels: list[ModuleLevel] | None = Query(default=None),
):
    return get_user_module_spars_controller(db=db, user=user, offset=offset, limit=limit, levels=levels)
