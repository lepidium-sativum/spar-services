from fastapi import Depends
from sqlmodel import Session
from typing import Annotated

# if TYPE_CHECKING:
from app.core.database import get_session

DBSessionDep = Annotated[Session, Depends(get_session)]
