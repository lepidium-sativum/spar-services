from app.core.config import get_base_config, load_env_vars

load_env_vars()
base_config = get_base_config()

workers = 1

bind = f"0.0.0.0:{base_config.server_port}"
timeout = 120
worker_class = "uvicorn.workers.UvicornWorker"
