from fastapi import APIRouter, status

from app.core.dependencies import DBSessionDep
from .service import get_health
from .models import Health

router = APIRouter()


@router.get(
    "",
    # include_in_schema=False,
    response_model=Health,
    status_code=status.HTTP_200_OK,
    responses={200: {"model": Health}},
    # responses={200: {"status": "ok"}},
)
def health(db: DBSessionDep):
    return get_health(db=db)
