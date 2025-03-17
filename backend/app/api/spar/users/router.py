from fastapi import APIRouter
from app.core.dependencies import DBSessionDep
from .models import UserRead
from ...auth.dependencies import NormalUserDep

router = APIRouter()


@router.get("/me", response_model=UserRead)
def get_my_account(db: DBSessionDep, user: NormalUserDep):
    """
    Get my own account details.
    """
    return user
