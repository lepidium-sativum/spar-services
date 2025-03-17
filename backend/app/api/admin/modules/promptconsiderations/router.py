from fastapi import APIRouter

from typing import List
from app.core.dependencies import DBSessionDep
from app.api.admin.modules.promptconsiderations.models import (
    PromptConsiderationRead,
    PromptConsiderationCreate,
)
from .controller import (
    create_prompt_consideration_controller,
    get_all_prompt_considerations_controller,
    delete_prompt_consideration_controller,
)

router = APIRouter()


@router.post("/considerations", response_model=PromptConsiderationRead)
def create_prompt_consideration(
    db: DBSessionDep, consideration: PromptConsiderationCreate
):
    """
    Create a prompt consideration.
    """
    return create_prompt_consideration_controller(db=db, consideration=consideration)


@router.get("", response_model=List[PromptConsiderationRead])
def get_all_prompt_considerations(db: DBSessionDep):
    """
    Get all prompt considerations.
    """
    return get_all_prompt_considerations_controller(db=db)


@router.delete("/{consideration_id}")
def delete_a_prompt_consideration(db: DBSessionDep, consideration_id: int):
    """
    Delete a prompt consideration.
    """
    return delete_prompt_consideration_controller(
        db=db, consideration_id=consideration_id
    )
