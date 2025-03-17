from langfuse.utils.langfuse_singleton import LangfuseSingleton

from app.api.llms.config import get_llm_config


def connect_langfuse_client():
    cfg = get_llm_config()
    if all([cfg.langfuse_public_key, cfg.langfuse_secret_key]):
        singleton = LangfuseSingleton()
        singleton.reset()  # is setup by mirascope
        singleton.get(public_key=cfg.langfuse_public_key, secret_key=cfg.langfuse_secret_key)
