import re
import asyncio
from sentry_sdk import capture_exception

from app.core.logger import logger
from .util import create_asyncssh_client
# from ..config import get_infra_config

OUTPUT_STATUS = "Workspace terminated"
TERMINATION_REGEX_PATTERN = r'Deleted workspace "([^"]+)"!'

# region HELPER FUNCTIONS
############## HELPER FUNCTIONS #############


def parse_output(line_str: str, workspace_id: str):
    match = re.search(TERMINATION_REGEX_PATTERN, line_str)
    if match:
        workspace_name = match.group(1)
        if workspace_id == workspace_name:
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


async def output_callback(line_str, workspace_id, output, logs):
    try:
        key, value = parse_output(line_str, workspace_id)
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


async def terminate_an_instance(workspace_id: str):
    output = {}
    logs = []
    command = f"cd ~/spar-iac/multi-user && ./destroy.sh -var {workspace_id}"
    # logger.info(f"command: {command}")
    try:
        client = await create_asyncssh_client()
        process = await client.create_process(command)

        await asyncio.gather(
            continuously_read_stdout(
                process.stdout,
                lambda line: output_callback(line, workspace_id, output, logs),
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
            logger.error(f"Workspace '{workspace_id}' was not terminated.")
            return 1, output, logs

    except Exception as e:
        capture_exception(e)
        err_message = f"An error occurred while running the command: {e}"
        logger.error(err_message)
        logs.append(err_message)
        return 1, {}, str(e)


# endregion
