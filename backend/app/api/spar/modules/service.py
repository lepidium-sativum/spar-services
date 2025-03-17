from sqlmodel import and_, select, desc, func, col, update, delete
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload

# from app.api.auth.dependencies import NormalUserDep
from app.core.util import recursive_vars, remove_excess
from app.core.dependencies import DBSessionDep
from app.core.exceptions import BadRequest
from app.core.logger import logger
from .exceptions import ModuleNotFound, ModuleNotAssignedToUser

from ..models_linking import UserModuleLink, ClientModuleLink
from ...admin.aiavatars.models import AIAvatar
from ..spars.models import Spar
from .models import Module, ModuleCreate, AssignModules, ModuleUpdate, ModuleLevel
from ...admin.modules.objectives.models import Objective
from ...admin.modules.promptconsiderations.models import PromptConsideration


def create_a_module(db: DBSessionDep, module: ModuleCreate):
    try:
        scenario_dict = module.scenario.model_dump()

        module_to_db = Module(
            name=module.name,
            avatar_id=module.avatar_id,
            system_prompt=remove_excess(module.system_prompt),
            scenario=scenario_dict,
        )
        db.add(module_to_db)
        db.commit()
        db.refresh(module_to_db)

        # Add objectives to the module
        for obj in module.objectives:
            objective = Objective(
                title=obj.title,
                description=obj.description,
                expanded_objective=obj.expanded_objective,
                analysis_prompt=remove_excess(obj.analysis_prompt),
                module_id=module_to_db.id,
            )

            db.add(objective)

        # Add considerations to the module
        for con in module.considerations:
            consideration = PromptConsideration(
                consideration=con.consideration,
                module_id=module_to_db.id,
            )
            db.add(consideration)

        db.commit()
        db.refresh(module_to_db)
        return module_to_db
    except IntegrityError as e:
        logger.exception(e)
        db.rollback()
        raise BadRequest(original_error=str(e.orig))
    except Exception as e:
        logger.exception(e)
        # raise DetailedHTTPException()
        raise BadRequest(original_error=str(e))


def assign_modules(db: DBSessionDep, payload: AssignModules):
    try:
        client_ids = set()
        user_ids = set()
        for assignee in payload.assignees:
            client_ids.add(assignee.client_id)
            user_ids.update(assignee.user_ids)

        for user_id in list(user_ids):
            for module_id in payload.modules:
                if not db.exec(
                    select(UserModuleLink).where(
                        UserModuleLink.user_id == user_id,
                        UserModuleLink.module_id == module_id,
                    )
                ).first():
                    user_module_link = UserModuleLink(
                        user_id=user_id,
                        module_id=module_id,
                    )
                    logger.info(user_module_link)
                    db.add(user_module_link)

        for client_id in list(client_ids):
            for module_id in payload.modules:
                if not db.exec(
                    select(ClientModuleLink).where(
                        ClientModuleLink.client_id == client_id,
                        ClientModuleLink.module_id == module_id,
                    )
                ).first():
                    client_module_link = ClientModuleLink(
                        client_id=client_id,
                        module_id=module_id,
                    )
                    logger.info(client_module_link)
                    db.add(client_module_link)

        db.commit()
        return {"ok": True}
    except IntegrityError as e:
        logger.exception(e)
        db.rollback()
        raise BadRequest(original_error=str(e.orig))
    except Exception as e:
        logger.exception(e)
        # raise DetailedHTTPException()
        raise BadRequest(original_error=str(e))


def update_user_module_rating(db: DBSessionDep, user_id: int, module_id: int):
    try:
        # TODO: should be done in controller. Will discuss. For now, let's go with it.
        user_module_link = check_if_user_is_assigned_module(db=db, user_id=user_id, module_id=module_id)
    except ModuleNotAssignedToUser:
        return
    # given a module and a user, calculate the average rating of all
    # spars of that module and user (where rating is not None)
    result: int | None = db.exec(
        select(func.round(func.avg(Spar.rating)))
        .select_from(Spar)
        .where(
            Spar.user_id == user_id,
            Spar.module_id == module_id,
            col(Spar.rating).isnot(None),
        )
    ).first()

    if result is not None:
        user_module_link.rating = result
        db.add(user_module_link)
        db.commit()


def check_if_user_is_assigned_module(db: DBSessionDep, user_id: int, module_id: int):
    statement = select(UserModuleLink).where(UserModuleLink.module_id == module_id, UserModuleLink.user_id == user_id)
    user_module = db.exec(statement).first()
    if not user_module:
        raise ModuleNotAssignedToUser()
    return user_module


async def check_if_user_assigned_module_async(db: DBSessionDep, user_id: int, module_id: int):
    statement = select(UserModuleLink).where(UserModuleLink.module_id == module_id, UserModuleLink.user_id == user_id)
    user_module = db.exec(statement).first()
    if not user_module:
        raise ModuleNotAssignedToUser()
    return user_module


def read_all_modules(db: DBSessionDep, offset: int, limit: int):
    modules = db.exec(
        select(Module)
        .options(
            selectinload(Module.objectives),
            selectinload(Module.promptconsiderations),
            selectinload(Module.aiavatar),
            selectinload(Module.aiavatar).selectinload(AIAvatar.metahuman),
            selectinload(Module.aiavatar).selectinload(AIAvatar.bgscene),
            selectinload(Module.aiavatar).selectinload(AIAvatar.personality),
        )
        .offset(offset)
        .limit(limit)
        .order_by(desc(Module.created_at))
    ).all()

    return [recursive_vars(module) for module in modules]


def read_all_module_spars(db: DBSessionDep, module_id: int, offset: int, limit: int):
    modules = db.exec(
        select(Module)
        .options(
            selectinload(Module.objectives),
            selectinload(Module.promptconsiderations),
            selectinload(Module.spars),
        )
        .where(Module.id == module_id)
        .offset(offset)
        .limit(limit)
        .order_by(desc(Module.created_at))
    ).all()

    return [vars(module) for module in modules]


def read_user_module_spars(
    db: DBSessionDep,
    user_id: int,
    offset: int,
    limit: int,
    levels: list[ModuleLevel] | None = None,
):
    query = (
        select(Module, UserModuleLink.is_completed, UserModuleLink.rating)
        .join(UserModuleLink, UserModuleLink.module_id == Module.id)
        .where(UserModuleLink.user_id == user_id)
    )
    if levels:
        query = query.where(col(Module.level).in_(levels))
    query = (
        query.options(selectinload(Module.spars.and_(Spar.user_id == user_id)))
        .offset(offset)
        .limit(limit)
        .order_by(desc(Module.created_at))
    )
    module_spars = db.exec(query).all()
    return [
        {"module": vars(module), "is_completed": is_completed, "rating": rating}
        for module, is_completed, rating in module_spars
    ]


def read_user_modules(
    db: DBSessionDep,
    user_id: int,
    offset: int,
    limit: int,
    module_as_dict: bool = False,
    levels: list[ModuleLevel] | None = None,
):
    query = (
        select(
            Module,
            UserModuleLink.is_completed,
            UserModuleLink.rating,
            func.count(Spar.id).label("num_attempts"),
        )
        .join(UserModuleLink, UserModuleLink.module_id == Module.id)
        # Outer join with Spar to include modules even if the user hasn't attempted them
        .outerjoin(Spar, and_(Spar.module_id == Module.id, Spar.user_id == user_id))
        .where(UserModuleLink.user_id == user_id)
    )

    if levels:
        query = query.where(col(Module.level).in_(levels))

    query = (
        # Group by to aggregate num_attempts for each module
        query.group_by(Module.id, UserModuleLink.is_completed, UserModuleLink.rating)
        .options(
            selectinload(Module.objectives),
            selectinload(Module.promptconsiderations),
            selectinload(Module.aiavatar),
            selectinload(Module.aiavatar).selectinload(AIAvatar.metahuman),
            selectinload(Module.aiavatar).selectinload(AIAvatar.bgscene),
            selectinload(Module.aiavatar).selectinload(AIAvatar.personality),
        )
        .offset(offset)
        .limit(limit)
        .order_by(desc(Module.created_at))
    )

    modules = db.exec(query).all()

    modules_with_signed_urls = []
    for row in modules:
        module, is_completed, rating, num_attempts = row
        AIAvatar.assign_signed_urls(module.aiavatar)

        modules_with_signed_urls.append(
            {
                "module": recursive_vars(module) if module_as_dict else module,
                "is_completed": is_completed,
                "rating": rating,
                "num_attempts": num_attempts,
            }
        )
    return modules_with_signed_urls


def read_a_module(db: DBSessionDep, module_id: int) -> Module:
    module = db.exec(
        select(Module)
        .options(
            selectinload(Module.objectives),
            selectinload(Module.promptconsiderations),
            selectinload(Module.aiavatar),
            selectinload(Module.aiavatar).selectinload(AIAvatar.metahuman),
            selectinload(Module.aiavatar).selectinload(AIAvatar.bgscene),
            selectinload(Module.aiavatar).selectinload(AIAvatar.personality),
        )
        .where(Module.id == module_id)
    ).first()
    if not module:
        raise ModuleNotFound(original_error=str(module_id))
    return module


def read_a_module_as_dict(db: DBSessionDep, module_id: int):
    module = read_a_module(db=db, module_id=module_id)
    serialized_module = recursive_vars(module)
    return serialized_module


def delete_a_module(db: DBSessionDep, module_id: int):
    module = db.get(Module, module_id)
    if not module:
        raise ModuleNotFound()
    db.delete(module)
    db.commit()
    return {"ok": True}


def update_a_module(db: DBSessionDep, module_id: int, module: ModuleUpdate):
    module_to_update = db.get(Module, module_id)
    if not module_to_update:
        raise ModuleNotFound()

    module_data = module.model_dump(exclude_unset=True, exclude={"objectives", "considerations"})
    module_to_update.sqlmodel_update(module_data)
    db.add(module_to_update)
    db.commit()
    db.refresh(module_to_update)

    # handle objectives
    if "objectives" in module.model_fields_set:
        update_a_modules_objectives(db=db, module=module_to_update, new_objectives=module.objectives)

    # handle considerations
    if "considerations" in module.model_fields_set:
        update_a_modules_considerations(db=db, module=module_to_update, new_considerations=module.considerations)

    return module_to_update


def update_a_modules_objectives(db: DBSessionDep, module: Module, new_objectives: list[Objective] | None):
    if not new_objectives:  # None or empty list, delete all objectives
        for objective in module.objectives:
            db.delete(objective)
    else:
        # Keep track of existing objective IDs
        old_objective_ids = set(obj.id for obj in module.objectives)

        for objective in new_objectives:
            if objective.id:
                # Update existing objective
                objective.module_id = module.id
                db.execute(
                    update(Objective)
                    .where(col(Objective.id) == objective.id)
                    .values(objective.model_dump(exclude_unset=True))
                )
                old_objective_ids.remove(objective.id)
            else:
                # Create new objective
                new_objective = Objective(**objective.model_dump(exclude_unset=True))
                new_objective.module_id = module.id
                db.add(new_objective)

        # Delete objectives that are no longer in the list
        if old_objective_ids:
            db.execute(delete(Objective).where(col(Objective.id).in_(old_objective_ids)))
    db.commit()
    db.refresh(module)


def update_a_modules_considerations(
    db: DBSessionDep,
    module: Module,
    new_considerations: list[PromptConsideration] | None,
):
    if not new_considerations:  # None or empty list, delete all considerations
        for consideration in module.promptconsiderations:
            db.delete(consideration)
    else:
        # Keep track of existing consideration IDs
        old_consideration_ids = set(con.id for con in module.promptconsiderations)

        for consideration in new_considerations:
            if consideration.id:
                # Update existing consideration
                consideration.module_id = module.id
                db.execute(
                    update(PromptConsideration)
                    .where(col(PromptConsideration.id) == consideration.id)
                    .values(consideration.model_dump(exclude_unset=True))
                )
                old_consideration_ids.remove(consideration.id)
            else:
                # Create new consideration
                new_consideration = PromptConsideration(**consideration.model_dump(exclude_unset=True))
                new_consideration.module_id = module.id
                db.add(new_consideration)

        # Delete considerations that are no longer in the list
        if old_consideration_ids:
            db.execute(delete(PromptConsideration).where(col(PromptConsideration.id).in_(old_consideration_ids)))
    db.commit()
    db.refresh(module)
