from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo
from pydantic import BaseModel, ConfigDict, model_validator

# You can use the jsonable_encoder to convert the input data
# to data that can be stored as JSON (e.g. with a NoSQL database).
# For example, converting datetime to str.
# https://fastapi.tiangolo.com/tutorial/body-updates/#update-replacing-with-put
from fastapi.encoders import jsonable_encoder


def convert_datetime_to_gmt(dt: datetime) -> str:
    if not dt.tzinfo:
        dt = dt.replace(tzinfo=ZoneInfo("UTC"))

    return dt.strftime("%Y-%m-%dT%H:%M:%S%z")


class SparBaseSchemaModel(BaseModel):
    model_config = ConfigDict(
        json_encoders={datetime: convert_datetime_to_gmt},
        populate_by_name=True,
    )

    @model_validator(mode="before")
    @classmethod
    def set_null_microseconds(cls, data: dict[str, Any]) -> dict[str, Any]:
        datetime_fields = {
            k: v.replace(microsecond=0)
            for k, v in data.items()
            if isinstance(v, datetime)
        }

        return {**data, **datetime_fields}

    def serializable_dict(self, **kwargs):
        """Return a dict which contains only serializable fields."""
        default_dict = self.model_dump()

        return jsonable_encoder(default_dict)
