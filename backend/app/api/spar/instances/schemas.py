from pydantic import Field, AnyHttpUrl  # EmailStr, BaseModel
from typing import Optional
from app.core.schemas import SparBaseSchemaModel


# region BASE MODELS
############### BASE MODELS #################


class VarsInstance(SparBaseSchemaModel):
    aws_region: str = None
    instance_id: str = None


class TTSServer(SparBaseSchemaModel):
    server: AnyHttpUrl = None


class VarsPixelStreaming(TTSServer):
    PixelStreamingIP: str = None  # AnyHttpUrl
    PixelStreamingPort: Optional[str] = None
    metahuman: str = None
    background: str = None
    port: Optional[str] = None


class InstancePayloadBase(SparBaseSchemaModel):
    vars: VarsInstance
    # inventory: Optional[str] = Field(
    #     None, description="A comma-separated list of inventory IPs"
    # )


class VarsSpinUpUEAndAppInstance(VarsInstance, VarsPixelStreaming):
    pass


class VarsStartUEApp(VarsPixelStreaming):
    pass


class VarsStopUEApp(SparBaseSchemaModel):
    pass


class VarsLLM(SparBaseSchemaModel):
    azure_subscription_id: str
    azure_tenant: str
    azure_resource_group: str
    azure_vm_name: str


#############################################
# endregion


# region API PAYLOAD MODELS
############ API PAYLOAD MODELS #############


class AcquireInstance(TTSServer):
    region: str = None


class TerminateInstance(SparBaseSchemaModel):
    instance_id: str


class SpinUpUEAndAppInstance(SparBaseSchemaModel):
    vars: VarsSpinUpUEAndAppInstance
    inventory: Optional[str] = Field(
        None, description="A comma-separated list of inventory IPs"
    )
    instance_id: str


class SpinDownUEInstance(InstancePayloadBase):  # SparBaseSchemaModel
    # vars: VarsInstance
    instance_id: str


class SpinUpUEInstance(InstancePayloadBase):
    instance_id: str


class StartUEApp(SparBaseSchemaModel):
    vars: VarsStartUEApp
    inventory: Optional[str] = Field(
        None, description="A comma-separated list of inventory IPs"
    )
    instance_id: str


class StopUEApp(SparBaseSchemaModel):
    vars: VarsStopUEApp
    inventory: Optional[str] = Field(
        None, description="A comma-separated list of inventory IPs"
    )
    instance_id: str


class UploadUEBuild(SparBaseSchemaModel):
    file_url: str = None
    bucket_name: str = Field(None, description="S3 Bucket name")
    s3_object_key: str = Field(None, description="S3 object key for the file")


class DeployUEBuild(InstancePayloadBase):
    s3_object_key: str = Field(..., description="S3 object key for the file")


class StartLLMServer(SparBaseSchemaModel):
    vars: VarsLLM
    inventory: Optional[str] = Field(
        None, description="A comma-separated list of inventory IPs"
    )
    instance_id: str


class StopLLMServer(SparBaseSchemaModel):
    vars: VarsLLM
    instance_id: str


#############################################
# endregion
