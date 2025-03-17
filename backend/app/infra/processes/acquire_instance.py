import re
import asyncio
from sentry_sdk import capture_exception

from app.core.logger import logger
from .util import create_asyncssh_client
from ..config import get_infra_config

COTURN_ALB_DOMAIN = "coturn_alb_domain"
COTURN_SERVICE_ALB_DNS = "coturn_service_alb_dns"
SERVER_INSTANCE_ID = "server_instance_id"
SERVER_PUBLIC_IP = "server_public_ip"
REQUIRED_KEYS = [
    COTURN_ALB_DOMAIN,
    COTURN_SERVICE_ALB_DNS,
    SERVER_INSTANCE_ID,
    SERVER_PUBLIC_IP,
]


# region HELPER FUNCTIONS
############## HELPER FUNCTIONS #############


def parse_output(line_str: str):
    patterns = {
        COTURN_ALB_DOMAIN: r"coturn_alb_domain\s*=\s*\"([^\"]+)\"",
        COTURN_SERVICE_ALB_DNS: r"coturn_service_alb_dns\s*=\s*\"([^\"]+)\"",
        SERVER_INSTANCE_ID: r"ue_server_instance_id\s*=\s*\"([^\"]+)\"",
        SERVER_PUBLIC_IP: r"ue_server_public_ip\s*=\s*\"([^\"]+)\"",
    }

    # Check for each pattern in the line_str
    for key, pattern in patterns.items():
        match = re.search(pattern, line_str)
        if match:
            return key, match.group(1)  # Return the key and matched value
    return None, None


async def continuously_read_stdout(stdout, output_callback):
    if stdout is None:
        logger.warning("No stdout available to read.")
        return

    try:
        async for stdout_line in stdout:
            line_str = stdout_line.strip()
            if line_str:
                await output_callback(line_str)
    except Exception as e:
        capture_exception(e)
        logger.error(f"Error while reading stdout: {e}")


async def continuously_read_stderr(stderr, error_callback):
    if stderr is None:
        logger.warning("No stderr available to read.")
        return

    try:
        async for stderr_line in stderr:
            error_str = stderr_line.strip()
            if error_str:
                await error_callback(error_str)
    except Exception as e:
        capture_exception(e)
        logger.error(f"Error while reading stderr: {e}")


async def output_callback(line_str, output, logs):
    try:
        key, value = parse_output(line_str)
        if key and value:
            output[key] = value
        logs.append(line_str)
        logger.info(f"Command output: {line_str}")
    except Exception as e:
        capture_exception(e)
        logger.error(f"Error in output callback: {e}")


async def error_callback(error_str, logs):
    try:
        logs.append(f"Error: {error_str}")
        logger.error(f"Command error: {error_str}")
    except Exception as e:
        capture_exception(e)
        logger.error(f"Error in error callback: {e}")


#############################################
# endregion

# region BASH SCRIPTS
# ################ BASH SCRIPTS ###############


async def acquire_an_instance(workspace_id: str, server: str, region: str):
    output = {}
    logs = []

    password = get_infra_config().ue_server_password
    command = f"cd ~/spar-iac/multi-user && ./setup.sh -var {workspace_id} -password {password} -server {server} -region {region}"
    # command = "ls -al"
    try:
        client = await create_asyncssh_client()
        process = await client.create_process(command)

        await asyncio.gather(
            continuously_read_stdout(
                process.stdout, lambda line: output_callback(line, output, logs)
            ),
            continuously_read_stderr(
                process.stderr, lambda line: error_callback(line, logs)
            ),
        )

        # Wait for the process to finish
        await process.wait()
        # Clean up the SSH client
        client.close()
        await client.wait_closed()

        missing_keys = [key for key in REQUIRED_KEYS if key not in output]
        if missing_keys:
            logger.error(f"Missing required values in output: {missing_keys}")
            return (1, output, logs)
        return 0, output, logs

    except Exception as e:
        capture_exception(e)
        err_message = f"An error occurred while running the command: {e}"
        logger.error(err_message)
        logs.append(err_message)
        return 1, {}, str(e)


# endregion
