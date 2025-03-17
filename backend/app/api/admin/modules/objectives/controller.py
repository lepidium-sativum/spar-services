from app.core.dependencies import DBSessionDep
from app.core.util import clean_list_output, remove_excess
from app.api.llms.clients.oai_client import generate_gpt4o_response
from .models import ObjectiveCreate, ObjectiveExpand
from .service import (
    create_an_objective,
    read_all_objectives,
    delete_an_objective,
)
from app.api.llms.controller import get_prompt_template_controller


def create_objective_controller(db: DBSessionDep, objective: ObjectiveCreate):
    return create_an_objective(db=db, objective=objective)


def expand_objective_controller(db: DBSessionDep, objective: ObjectiveExpand):
    expanded_objective = generate_gpt4o_response(
        user_message=objective.description,
        prompt=remove_excess(
            get_prompt_template_controller(
                template_name="expand_objective_prompt", filled=True
            )
        ),
    )
    return clean_list_output(expanded_objective)


def get_all_objectives_controller(db: DBSessionDep):
    return read_all_objectives(db=db)


def delete_objective_controller(db: DBSessionDep, objective_id: int):
    return delete_an_objective(db=db, objective_id=objective_id)
