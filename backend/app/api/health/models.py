from enum import Enum
from pydantic import BaseModel


class Status(str, Enum):
    OK = "OK"
    NOK = "Not OK"


class Health(BaseModel):
    app_status: Status | None
    db_status: Status | None
