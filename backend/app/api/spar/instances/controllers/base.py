from app.core.dependencies import DBSessionDep
from app.api.spar.users.service import read_a_user
from ..models.instance_base import InstanceBase
from ..service import read_an_instance

# region HELPER FUNCTIONS
############## HELPER FUNCTIONS #############


def get_db_objects(
    db: DBSessionDep, user_id: int, instance_id: int, instance_model: InstanceBase
):
    user = read_a_user(db=db, user_id=user_id)
    instance = read_an_instance(
        db=db, instance_id=instance_id, instance_model=instance_model
    )
    return user, instance


#############################################
# endregion
