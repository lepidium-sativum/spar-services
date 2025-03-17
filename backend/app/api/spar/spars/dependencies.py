from fastapi import Depends
from typing import Annotated

from .models import Spar
from .service import (
    read_a_spar,
    read_user_owned_spar,
    read_user_owned_or_admin_spar,
)

ValidSparDep = Annotated[Spar, Depends(read_a_spar)]
ValidUserOwnedSparDep = Annotated[Spar, Depends(read_user_owned_spar)]
ValidUserOwnedOrAdminSparDep = Annotated[Spar, Depends(read_user_owned_or_admin_spar)]
