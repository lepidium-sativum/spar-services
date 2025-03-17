from .schemas import SparBaseSchemaModel


def convert_dict_to_string(data) -> str:
    # Convert a Pydantic model to a dict if it is a Pydantic object
    if isinstance(data, SparBaseSchemaModel):
        data = data.dict()

    # Convert dictionary-like object (including nested models) to string
    return " ".join(
        [
            f"{key}={str(value).strip()}"
            for key, value in data.items()
            if value is not None
        ]
    )
