from app.core.dependencies import DBSessionDep
from app.api.admin.modules.promptconsiderations.models import (
    PromptConsiderationCreate,
)
from .service import create_a_prompt_consideration, read_all_prompt_considerations, delete_a_prompt_consideration


def create_prompt_consideration_controller(db: DBSessionDep, consideration: PromptConsiderationCreate):
    return create_a_prompt_consideration(db=db, consideration=consideration)


def get_all_prompt_considerations_controller(db: DBSessionDep):
    return read_all_prompt_considerations(db=db)


def delete_prompt_consideration_controller(db: DBSessionDep, consideration_id: int):
    return delete_a_prompt_consideration(db=db, consideration_id=consideration_id)
