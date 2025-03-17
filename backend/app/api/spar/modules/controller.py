from app.api.spar.modules.models import ModuleLevel
from app.core.dependencies import DBSessionDep
from app.api.auth.dependencies import NormalUserDep
from .service import read_user_modules, read_user_module_spars


def get_user_modules_controller(
    db: DBSessionDep,
    user: NormalUserDep,
    offset: int,
    limit: int,
    levels: list[ModuleLevel] | None = None,
):
    return read_user_modules(db=db, user_id=user.id, offset=offset, limit=limit, levels=levels)


def get_user_module_spars_controller(
    db: DBSessionDep,
    user: NormalUserDep,
    offset: int,
    limit: int,
    levels: list[ModuleLevel] | None = None,
):
    return read_user_module_spars(db=db, user_id=user.id, offset=offset, limit=limit, levels=levels)
