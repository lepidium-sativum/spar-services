from fastapi import Depends
from typing import Annotated


from .models import Module
from .service import read_a_module


ValidModuleDep = Annotated[Module, Depends(read_a_module)]
