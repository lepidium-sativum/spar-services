from fastapi import APIRouter
from typing import List
from app.core.dependencies import DBSessionDep

from .controller import (
    create_personality_controller,
    get_all_personalities_controller,
    get_a_personality_controller,
    delete_personality_controller,
)

from .models import PersonalityRead, PersonalityCreate

router = APIRouter()


@router.post("", response_model=PersonalityRead)
def create_personality(db: DBSessionDep, personality: PersonalityCreate):
    """
    Create a new Personality.
    """
    return create_personality_controller(db=db, personality=personality)


@router.get("", response_model=List[PersonalityRead])
def get_all_personalities(db: DBSessionDep):
    """
    Get all personalities.
    """
    return get_all_personalities_controller(db=db)


@router.get("/{personality_id}", response_model=PersonalityRead)
def get_a_personality(db: DBSessionDep, personality_id: int):
    """
    Get a specific personality
    """
    return get_a_personality_controller(db=db, personality_id=personality_id)


@router.delete("/{personality_id}")
def delete_a_personality(db: DBSessionDep, personality_id: int):
    """
    Delete a personality.
    """
    return delete_personality_controller(db=db, personality_id=personality_id)
