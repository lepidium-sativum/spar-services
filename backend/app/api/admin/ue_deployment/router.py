from fastapi import APIRouter, BackgroundTasks

from app.core.dependencies import DBSessionDep
from app.api.auth.dependencies import NormalUserDep
from app.api.spar.instances.controllers.aws import deploy_ue_build_controller
from app.api.spar.instances.schemas import UploadUEBuild, DeployUEBuild
from app.aws.s3client import copy_file_from_url_to_s3


router = APIRouter()

# region UE UPLOAD/DEPLOYMENT SCRIPTS
########### UE UPLOAD/DEPLOYMENT SCRIPTS ###########


@router.post("/build/upload")
async def upload_ue_build(
    db: DBSessionDep,
    user: NormalUserDep,
    payload: UploadUEBuild,
):
    """
    Upload UE build
    """
    await copy_file_from_url_to_s3(
        file_url=payload.file_url,
        bucket_name=payload.bucket_name,
        s3_key=payload.s3_object_key,
    )
    return {
        "statusCode": 200,
        "body": f"File uploaded successfully to {payload.bucket_name}/{payload.s3_object_key}",
    }


@router.post("/build/deploy")
async def deploy_ue_build(
    db: DBSessionDep,
    user: NormalUserDep,
    payload: DeployUEBuild,
    background_tasks: BackgroundTasks,
):
    """
    Deploy UE build in background
    """
    background_tasks.add_task(
        deploy_ue_build_controller,
        db=db,
        user_id=user.id,
        extra_vars=payload.vars.model_dump(),
        s3_object_key=payload.s3_object_key,
    )
    return payload


#############################################
# endregion
