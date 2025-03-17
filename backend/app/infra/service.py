import ansible_runner
import subprocess
import re
import os
from sentry_sdk import capture_exception

from app.core.logger import logger
from .constants import ErrorCode
from .exceptions import (
    StartingLLMFailed,
    StoppingLLMFailed,
    StartingUEFailed,
    StoppingUEFailed,
)
from .config import get_infra_config


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
################ BASH SCRIPTS ###############


def acquire_an_instance(server_name: str):
    output = {}
    logs = []
    try:
        script_path = os.path.join(os.path.dirname(__file__), "./terraform/setup.sh")
        workspace_id = server_name
        password = get_infra_config().ue_server_password
        process = subprocess.Popen(
            [
                "/bin/bash",
                script_path,
                "-var",
                workspace_id,
                "-password",
                password,
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True,
        )
        # logger.debug(process)

        stdout_data, stderr_data = process.communicate()
        if process.returncode != 0:
            logger.error(f"Error: {stderr_data}")
            logs.append(f"Error: {stderr_data}")
        else:
            for stdout_line in iter(process.stdout.readline, ""):
                line_str = stdout_line.strip()  # stdout_line.decode("utf-8").strip()
                logs.append(line_str)
                print(line_str)
                key, value = parse_acquire_instance_output(line_str=line_str)
                if key and value:
                    output[key] = value

            # process.stdout.close()
            # return_code = process.wait()
            # subprocess.run(command, check=True)
        return process.returncode, output, logs

    except subprocess.CalledProcessError as e:
        logger.warning(f"{ErrorCode.ACQUIRING_INSTANCE_FAILED}: {e}")
        capture_exception(e)
        return 1, {}, e


def terminate_an_instance(server_name: str):
    logs = []
    script_path = os.path.join(os.path.dirname(__file__), "./terraform/destroy.sh")
    process = subprocess.Popen(
        ["/bin/bash", script_path, "-var", server_name],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
        universal_newlines=True,
    )

    for stdout_line in iter(process.stdout.readline, ""):
        line_str = stdout_line.strip()
        logs.append(line_str)
        print(line_str)

    process.stdout.close()
    return_code = process.wait()

    return return_code, logs


#############################################
# endregion


# region UE ANSIBLE SCRIPTS
############ UE ANSIBLE SCRIPTS #############


def spin_up_both_ue_instance_and_app(extra_vars, inventory):
    extra_vars = add_ue_credentials(extra_vars=extra_vars.serializable_dict())
    logger.info(f"extra_vars after: {extra_vars}")
    try:
        base_path = os.path.dirname(__file__)
        base_playbooks_path = os.path.join(base_path, "ansible/playbooks")
        # config_path = os.path.join(base_path, "ansible/ansible.cfg")
        env = {}
        # env["ANSIBLE_CONFIG"] = config_path
        runner = ansible_runner.run(
            private_data_dir=base_playbooks_path,
            playbook="start-ue-combined.yml",
            extravars=extra_vars,
            inventory=inventory,
            # cmdline="-vvv",  # Verbosity option for more detailed output
            envvars=env,
            verbosity=3,
        )

        # Check if the playbook execution was successful
        if runner.rc != 0:
            raise StartingUEFailed
        # HTTPException(
        #       status_code=500,
        #       detail=f"Ansible playbook failed with status: {runner.status} and rc: {runner.rc}",
        #   )
        return 0, {}, runner.stdout.read()
        # return {
        #     "status": runner.status,
        #     "rc": runner.rc,
        #     "stdout": runner.stdout.read(),
        #     "stderr": runner.stderr.read(),
        # }
    except Exception as e:
        capture_exception(e)
        # logger.error(ErrorCode.STARTING_UE_FAILED)  # : {e.stderr.decode()}
        # return False
        return 1, {}, e


def spin_down_ue_instance_only(extra_vars):
    extra_vars = add_ue_credentials(extra_vars=extra_vars)
    try:
        base_path = os.path.dirname(__file__)
        base_playbooks_path = os.path.join(base_path, "ansible/playbooks")
        config_path = os.path.join(base_path, "ansible/ansible.cfg")
        env = {}
        env["ANSIBLE_CONFIG"] = config_path
        runner = ansible_runner.run(
            private_data_dir=base_playbooks_path,
            playbook="stop-ue-server.yml",
            extravars=extra_vars,
            # cmdline="-v",  # Verbosity option for more detailed output
            envvars=env,
            verbosity=3,
        )
        if runner.rc != 0:
            raise StoppingUEFailed
        return {
            "status": runner.status,
            "rc": runner.rc,
            "stdout": runner.stdout.read(),
            "stderr": runner.stderr.read(),
        }
    except Exception as e:
        capture_exception(e)
        logger.error(f"{ErrorCode.STOPPING_UE_FAILED}")  # : {e.stderr.decode()}
        return False


def spin_up_ue_instance_only(extra_vars):
    extra_vars = add_ue_credentials(extra_vars=extra_vars)


def start_ue_app_only(extra_vars):
    extra_vars = add_ue_credentials(extra_vars=extra_vars)


def stop_ue_app_only(extra_vars):
    extra_vars = add_ue_credentials(extra_vars=extra_vars)


# def status_ue_instance():
#   pass

#############################################
# endregion


# region UE DEPLOYMENT SCRIPTS
########### UE DEPLOYMENT SCRIPTS ###########


def deploy_ue_build(extra_vars):
    add_ue_credentials(extra_vars)


#############################################
# endregion

# region LLM ANSIBLE SCRIPTS
############ LLM ANSIBLE SCRIPTS ############


def start_llm_server(extra_vars, inventory):
    extra_vars = add_llm_credentials(extra_vars=extra_vars)
    try:
        # env = {
        #   "ANSIBLE_CONFIG": "/backend/app/infra/ansible/ansible.cfg",
        #   "ANSIBLE_PYTHON_INTERPRETER": "/backend/.venv/bin/python",
        #   "ANSIBLE_PLAYBOOK": "/backend/.venv/bin/ansible-playbook",  # Explicit path
        # }
        base_path = os.path.dirname(__file__)
        base_playbooks_path = os.path.join(base_path, "ansible/playbooks")
        config_path = os.path.join(base_path, "ansible/ansible.cfg")
        password_path = os.path.join(base_path, "ansible/passwords")
        env = {}
        env["ANSIBLE_CONFIG"] = config_path  # "/backend/app/infra/ansible/ansible.cfg"
        runner = ansible_runner.run(
            private_data_dir=base_playbooks_path,  # "/backend/app/infra/ansible/playbooks",
            playbook="start-llm-server.yml",
            inventory=inventory,  # "/backend/app/infra/ansible/inventory/hosts",
            cmdline=f"--vault-password-file={password_path}",  # /backend/app/infra/ansible/passwords
            quiet=False,
            envvars=env,
            extra_vars=extra_vars,
            verbosity=3,
        )
        # print(runner)
        # for each_host_event in runner.events:
        #   print(each_host_event['event'])
        #   print("Final status:")
        print(runner.stats)

        # if runner.rc != 0:
        #   raise StartingLLMFailed # runner.rc

        # raise HTTPException(
        #     status_code=500, detail=f"Ansible playbook failed: {r.stderr}"
        # )
        return {
            "status": runner.status,
            "rc": runner.rc,
            "stdout": runner.stdout.read(),
            "stderr": runner.stderr.read(),
        }

    except Exception as e:
        capture_exception(e)
        # logger.error(ErrorCode.STARTING_LLM_FAILED)
        return False
        # raise HTTPException(status_code=500, detail=str(e))


def stop_llm_server(extra_vars):
    extra_vars = add_llm_credentials(extra_vars=extra_vars)
    try:
        base_path = os.path.dirname(__file__)
        base_playbooks_path = os.path.join(base_path, "ansible/playbooks")
        config_path = os.path.join(base_path, "ansible/ansible.cfg")
        password_path = os.path.join(base_path, "ansible/passwords")
        env = {}
        env["ANSIBLE_CONFIG"] = config_path
        runner = ansible_runner.run(
            private_data_dir=base_playbooks_path,
            playbook="stop-llm-server.yml",
            cmdline=f"--vault-password-file={password_path}",
            envvars=env,
            extra_vars=extra_vars,
            quiet=False,
            verbosity=3,
        )
        if runner.rc != 0:
            raise StoppingLLMFailed
        return {
            "status": runner.status,
            "rc": runner.rc,
            "stdout": runner.stdout.read(),
            "stderr": runner.stderr.read(),
        }
    except Exception as e:
        capture_exception(e)
        logger.error(f"{ErrorCode.STOPPING_LLM_FAILED}")
        return False


#############################################
# endregion
