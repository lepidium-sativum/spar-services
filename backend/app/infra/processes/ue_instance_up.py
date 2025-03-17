# import re
import asyncio
from sentry_sdk import capture_exception

from app.core.logger import logger
from .util import create_asyncssh_client, convert_dict_to_string
# from ..config import get_infra_config

EXPECTED_LINE_TEMPLATE = "The instance {server_instance_id} is now started."
EXPECTED_LINE2 = "Current state of the instance is running"
OUTPUT_STATUS = "UE instance started"

# region HELPER FUNCTIONS
############## HELPER FUNCTIONS #############


# TODO: (InsufficientInstanceCapacity)
def parse_output(line_str: str, server_instance_id: str):
    expected_line = EXPECTED_LINE_TEMPLATE.format(server_instance_id=server_instance_id)
    if expected_line in line_str or EXPECTED_LINE2 in line_str:
        return "status", OUTPUT_STATUS
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


async def output_callback(line_str, server_instance_id, output, logs):
    try:
        key, value = parse_output(line_str, server_instance_id)
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


async def spin_up_ue_instance_only(extra_vars: dict, server_instance_id: str):
    output = {}
    logs = []
    extra_vars_str = convert_dict_to_string(data=extra_vars)
    payload = f'./playbooks/start-ue-server.yml --extra-vars "{extra_vars_str}"'
    command = f"cd ~/spar-iac/multi-user && ansible-playbook {payload}"
    try:
        client = await create_asyncssh_client()
        process = await client.create_process(command)

        await asyncio.gather(
            continuously_read_stdout(
                process.stdout,
                lambda line: output_callback(line, server_instance_id, output, logs),
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

        if "status" in output and output["status"] == OUTPUT_STATUS:
            return 0, output, logs
        else:
            logger.error("Starting UE instance FAILED.")
            return 1, output, logs

    except Exception as e:
        capture_exception(e)
        err_message = f"An error occurred while running the command: {e}"
        logger.error(err_message)
        logs.append(err_message)
        return 1, {}, str(e)


# endregion
