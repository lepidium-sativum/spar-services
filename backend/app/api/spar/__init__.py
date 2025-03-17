from fastapi import APIRouter

from app.api.spar.users import router as users
from app.api.spar.spars import router as spars
from app.api.spar.modules import router as modules
from app.api.spar.analysis import router as analysis
from app.api.spar.rooms_manager import router as room_manager

api_router = APIRouter()

####### USER ROUTES #######
api_router.include_router(users.router, prefix="/users", tags=["Users"])
###############################

######## SPAR ROUTES ##########
api_router.include_router(spars.router, prefix="/spars", tags=["Spars"])
###############################

####### MODULE ROUTES #########
api_router.include_router(modules.router, prefix="/modules", tags=["Modules"])
###############################

####### ANALYSIS ROUTES #######
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
###############################

####### ROOM ROUTES #########
api_router.include_router(room_manager.router, prefix="/rooms", tags=["Rooms"])
###############################
