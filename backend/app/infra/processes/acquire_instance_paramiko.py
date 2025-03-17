import re
import paramiko
from sentry_sdk import capture_exception

# import io
from app.core.logger import logger
from .util import create_paramiko_client
from ..config import get_infra_config

# region HELPER FUNCTIONS
############## HELPER FUNCTIONS #############


def parse_acquire_instance_output(line_str: str):
    # Define regex patterns for each key
    patterns = {
        "coturn_alb_domain": r"coturn_alb_domain:\s*(\S+)",
        "coturn_service_alb_dns": r"coturn_service_alb_dns:\s*(\S+)",
        "server_instance_id": r"ue_server_instance_id:\s*(\S+)",
        "server_public_ip": r"ue_server_public_ip:\s*(\S+)",
    }

    # Check for each pattern in the line_str
    for key, pattern in patterns.items():
        match = re.search(pattern, line_str)
        if match:
            return key, match.group(1)  # Return the key and matched value

    return None, None


#############################################
# endregion


# region BASH SCRIPTS
# ################ BASH SCRIPTS ###############


def acquire_an_instance(command: str):
    logs = []
    output = {}
    try:
        client = create_paramiko_client()
        password = get_infra_config().ue_server_password
        command = f"{command} -password {password}"
        # final_command = command + f" -password {password}"
        # logger.info(f"final_command: {final_command}")
        stdin, stdout, stderr = client.exec_command(command=command)

        # Reading stdout line by line
        for stdout_line in iter(stdout.readline, ""):
            line_str = stdout_line.strip()
            logs.append(line_str)
            logger.info(line_str)

            key, value = parse_acquire_instance_output(line_str=line_str)
            if key and value:
                output[key] = value

        # Check if there are errors in stderr
        error_output = stderr.read().decode()
        if error_output:
            logger.error(f"Error: {error_output}")
            logs.append(f"Error: {error_output}")

        client.close()
        return stdout.channel.recv_exit_status(), output, logs

    except paramiko.SSHException as e:
        capture_exception(e)
        logger.error(f"SSH connection failed: {e}")
        logs.append(f"SSH connection failed: {e}")
        return 1, output, logs

    except Exception as e:
        capture_exception(e)
        logger.error(f"Unexpected error: {e}")
        logs.append(f"Unexpected error: {e}")
        return 1, output, logs


# endregion
