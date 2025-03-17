from app.core.schemas import SparBaseSchemaModel


class CreateRoomPayload(SparBaseSchemaModel):
    module_id: int
