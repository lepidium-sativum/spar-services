from app.core.dependencies import DBSessionDep
from .models import PersonalityCreate
from .service import (
    create_a_personality,
    read_all_personalities,
    read_a_personality,
    delete_a_personality,
)


def create_personality_controller(db: DBSessionDep, personality: PersonalityCreate):
    return create_a_personality(db=db, personality=personality)


def get_all_personalities_controller(db: DBSessionDep):
    return read_all_personalities(db=db)


def get_a_personality_controller(db: DBSessionDep, personality_id: int):
    return read_a_personality(db=db, personality_id=personality_id)


def delete_personality_controller(db: DBSessionDep, personality_id: int):
    return delete_a_personality(db=db, personality_id=personality_id)
