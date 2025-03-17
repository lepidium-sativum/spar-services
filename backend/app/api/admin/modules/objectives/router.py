from fastapi import APIRouter

from typing import List
from app.core.dependencies import DBSessionDep
from app.api.admin.modules.objectives.models import (
    ObjectiveRead,
    ObjectiveCreate,
    ObjectiveExpand,
)
from .controller import (
    create_objective_controller,
    expand_objective_controller,
    get_all_objectives_controller,
    delete_objective_controller,
)

router = APIRouter()


@router.post("/expand")  # response_model=ObjectiveRead
def expand_objective(db: DBSessionDep, objective: ObjectiveExpand):
    """
    Expand an objective.
    """
    return expand_objective_controller(db=db, objective=objective)


@router.post("", response_model=ObjectiveRead)
def create_objective(db: DBSessionDep, objective: ObjectiveCreate):
    """
    Create an objective.
    """
    return create_objective_controller(db=db, objective=objective)


@router.get("", response_model=List[ObjectiveRead])
def get_all_objectives(db: DBSessionDep):
    """
    Get all objectives.
    """
    return get_all_objectives_controller(db=db)


@router.delete("/{objective_id}")
def delete_an_objective(db: DBSessionDep, objective_id: int):
    """
    Delete an objective.
    """
    return delete_objective_controller(db=db, objective_id=objective_id)
