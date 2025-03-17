from typing import cast

from pydantic import BaseModel

from app.api.admin.aiavatars.models import AIAvatar
from app.api.admin.personalities.models import LLM, TTS, Personality
from app.api.spar.modules.models import (
    AvatarMode,
    Emotion,
    Module,
    ScenarioBase,
    ScenarioRoles,
    DEFAULT_ROLES,
)
from app.api.spar.spars.exceptions import SparNotFound
from app.api.spar.spars.models import Spar
from app.core.util import create_redis_spar_key
from app.core.redis import RedisData, set_redis_key, get_by_key, delete_by_key


class SparRedis(BaseModel):
    system_prompt: str
    avatar_mode: AvatarMode
    tts: TTS
    llm: LLM
    roles: ScenarioRoles
    greeting_messages: list[str] | None
    initial_emotion: Emotion
    messages: list[dict[str, str]] = []
    room_id: str

    # for convenience
    user_id: int
    spar_id: int

    @staticmethod
    def from_spar(spar: Spar):
        module = cast(Module, spar.module)
        avatar = cast(AIAvatar, module.aiavatar)
        personality = cast("Personality", avatar.personality)
        scenario = ScenarioBase.model_validate(module.scenario)
        roles: ScenarioRoles = scenario.roles or DEFAULT_ROLES

        # TODO: what if personality.tts is None?
        return SparRedis(
            system_prompt=module.system_prompt,
            avatar_mode=module.avatar_mode,
            tts=personality.tts,
            llm=personality.llm,
            roles=roles,
            greeting_messages=scenario.greeting_messages,
            initial_emotion=scenario.initial_emotion,
            user_id=spar.user_id,
            spar_id=spar.id,
            room_id=str(spar.room_id) if spar.room_id else "default",
        )

    @staticmethod
    async def from_redis(user_id: int, spar_id: int) -> "SparRedis":
        redis_key = create_redis_spar_key(user_id, spar_id)
        spar_json = await get_by_key(redis_key)
        if not spar_json:
            raise SparNotFound
        return SparRedis.model_validate_json(spar_json)

    async def save_to_redis(self):
        redis_key = create_redis_spar_key(self.user_id, self.spar_id)
        spar_json = self.model_dump_json()
        await set_redis_key(RedisData(key=redis_key, value=spar_json))

    async def save_llm_response(self, cleaned_msg: str):
        self.messages.append({"role": "assistant", "content": cleaned_msg.strip()})
        await self.save_to_redis()

    async def delete_from_redis(self):
        redis_key = create_redis_spar_key(self.user_id, self.spar_id)
        await delete_by_key(redis_key)

    def tag_conversation(self) -> list[dict[str, str]]:
        """Returns a copy of the conversation with the roles tagged in the message content"""
        roles = self.roles
        return [
            {
                "role": message["role"],
                "content": (
                    f"<{roles[message['role']]}>: {message['content']}"
                    if message["role"] in roles  # i.e. user or avatar
                    else message["content"]  # system
                ),
            }
            for message in self.messages
        ]
