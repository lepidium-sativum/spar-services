from fastapi import APIRouter

from app.api.admin.aiavatars import router as admin_avatars
from app.api.admin.clients import router as admin_clients
from app.api.admin.metahumans import router as admin_metahumans
from app.api.admin.modules import router as admin_modules
from app.api.admin.modules.objectives import router as admin_objectives
from app.api.admin.modules.promptconsiderations import (
    router as admin_prompt_considerations,
)
from app.api.admin.personalities import router as admin_personalities
from app.api.admin.spars import router as spars
from app.api.admin.bg_scenes import router as admin_bg_scenes
from app.api.admin.users import router as admin_users
from app.api.admin.instances import router as instances
from app.api.admin.ue_deployment import router as ue_deployment
from app.api.admin.rooms import router as rooms


api_router = APIRouter()


###### AIAVATAR ROUTES ########
api_router.include_router(admin_avatars.router, prefix="/aiavatars", tags=["Admin AIAvatars"])
###############################

####### CLIENTS ROUTES ########
api_router.include_router(admin_clients.router, prefix="/clients", tags=["Admin Clients"])
###############################


####### METAHUMANS ROUTES ########
api_router.include_router(admin_metahumans.router, prefix="/metahumans", tags=["Admin Metahumans"])
###############################

####### MODULES ROUTES ########
api_router.include_router(admin_modules.router, prefix="/modules", tags=["Admin Modules"])
###############################

####### OBJECTIVES ROUTES ########
api_router.include_router(admin_objectives.router, prefix="/objectives", tags=["Admin Objectives"])
###############################

####### PROMPT CONSIDERATIONS ROUTES ########
api_router.include_router(
    admin_prompt_considerations.router,
    prefix="/promptconsiderations",
    tags=["Admin Prompt Considerations"],
)
###############################

#### PERSONALITIES ROUTES #####
api_router.include_router(admin_personalities.router, prefix="/personalities", tags=["Admin Personalities"])
###############################

######## SPAR ROUTES ##########
api_router.include_router(
    spars.router,
    prefix="/spars",
    tags=["Admin Sales Spars"],
)
###############################

#### BG SCENES ROUTES ####
api_router.include_router(admin_bg_scenes.router, prefix="/scenes", tags=["Admin Scenes"])
###############################

######## USERS ROUTES #########
api_router.include_router(admin_users.router, prefix="/users", tags=["Admin Users"])
###############################


####### Instances ROUTES #########
api_router.include_router(instances.router, prefix="/instances", tags=["Admin Instances"])
###############################

####### Rooms ROUTES #########
api_router.include_router(rooms.router, prefix="/rooms", tags=["Admin Rooms"])
###############################


####### UE DEPLOYMENT ROUTES #########
api_router.include_router(ue_deployment.router, prefix="/ue", tags=["Admin UE Deployments"])
###############################
