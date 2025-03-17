from fastapi import APIRouter, Depends

from app.api.admin import api_router as admin
from app.api.auth import router as auth
from app.api.auth.dependencies import RoleChecker
from app.api.health import router as health
from app.api.spar import api_router as spar
from app.core.config import get_base_config

api_router = APIRouter()

api_ver_no = get_base_config().api_version

api_router.include_router(health.router, prefix="/health", tags=["Health"])

######## AUTH ROUTES ##########
api_router.include_router(auth.router, prefix=f"/api/v{api_ver_no}/auth", tags=["Auth"])
###############################

######## ADMIN ROUTES #########
api_router.include_router(
    admin,
    prefix=f"/api/v{api_ver_no}/admin",
    # tags=["Admin"],
    dependencies=[Depends(RoleChecker(allowed_roles=["admin"]))],
)
###############################

######## SPAR ROUTES ##########
api_router.include_router(spar, prefix=f"/api/v{api_ver_no}")  # tags=["SPAR"]
###############################
