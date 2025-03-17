# import paramiko
import asyncssh
# import os

# import tempfile
from app.core.logger import logger
from ..config import get_infra_config


async def create_asyncssh_client():
    try:
        hostname = get_infra_config().bastion_hostname
        username = get_infra_config().bastion_username
        private_key = get_infra_config().bastion_private_key
        private_key_obj = asyncssh.import_private_key(private_key)
        # private_key_path = os.path.join(
        #     os.path.dirname(__file__), "../ansible/spar-aws-bastion-host.pem"
        # )
        client = await asyncssh.connect(
            hostname, username=username, client_keys=[private_key_obj], known_hosts=None
        )
        return client
    except asyncssh.Error as e:
        logger.error(f"SSH connection failed: {e}")
        raise


# def create_paramiko_client():
#     try:
#         hostname = get_infra_config().bastion_hostname
#         username = get_infra_config().bastion_username
#         private_key_path = os.path.join(
#             os.path.dirname(__file__), "../ansible/spar-aws-bastion-host.pem"
#         )

#         # private_key_content = get_infra_config().bastion_private_key
#         # private_key_buffer = io.StringIO(private_key_content)
#         # with tempfile.NamedTemporaryFile(delete=False) as temp_key_file:
#         #     temp_key_file.write(private_key_content.encode())
#         #     temp_key_file.flush()
#         # private_key = paramiko.ECDSAKey.from_private_key(private_key_buffer)
#         client = paramiko.SSHClient()
#         client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
#         # private_key = paramiko.RSAKey.from_private_key_file(private_key_path)
#         # client.connect(hostname=hostname, username=username, pkey=private_key)
#         client.connect(
#             hostname=hostname,
#             username=username,
#             key_filename=private_key_path,  # temp_key_file.name
#         )
#         return client

#     except paramiko.SSHException as ssh_error:
#         logger.error(f"SSH connection error: {ssh_error}")
#         raise ssh_error

#     except Exception as e:
#         logger.error(f"Failed to create SSH client: {e}")
#         raise e


# region HELPER FUNCTIONS
############## HELPER FUNCTIONS #############


def add_ue_credentials(extra_vars):
    extra_vars.update(
        {
            "ansible_user": get_infra_config().ue_server_username,
            "ansible_password": get_infra_config().ue_server_password,
        }
    )
    return extra_vars


def add_llm_credentials(extra_vars):
    extra_vars.update(
        {
            "ansible_user": get_infra_config().azure_username,
            "azure_client_id": get_infra_config().azure_client_id,
            "azure_secret": get_infra_config().azure_secret,
        }
    )
    return extra_vars


def convert_dict_to_string(data) -> str:
    return " ".join(
        [
            f"{key}={str(value).strip()}"
            for key, value in data.items()
            if value is not None
        ]
    )


#############################################
# endregion
