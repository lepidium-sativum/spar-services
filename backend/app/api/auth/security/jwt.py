from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone

from pydantic import ValidationError

from app.core.logger import logger
from app.core.exceptions import DetailedHTTPException
from ..config import get_auth_config
from ..exceptions import InvalidCredentials


def create_jwt_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(seconds=expires_delta)
    to_encode.update({"iat": now, "exp": expire})
    # expire = datetime.now(timezone.utc) + expires_delta
    # to_encode.update({"exp": expire})
    encoded_jwt = encode_token(to_encode)
    return encoded_jwt


def refresh_token(expired_token, expires_delta: timedelta | None = None):
    try:
        payload = jwt.decode(
            expired_token,
            get_auth_config().jwt_secret,
            algorithms=[get_auth_config().jwt_alg],
            options={"verify_exp": False},
        )
        username = payload["sub"]
        role = payload["role"]
        now = datetime.now(timezone.utc)
        expire = now + timedelta(seconds=expires_delta)
        to_encode = {"sub": username, "role": role, "iat": now, "exp": expire}
        # expire = datetime.now(timezone.utc) + expires_delta
        # to_encode = {"sub": username, "role": role, "exp": expire}
        new_token = encode_token(to_encode)
        return {"token": new_token}
    except (JWTError, ValidationError):
        raise InvalidCredentials


def encode_token(to_encode):
    return jwt.encode(
        to_encode, get_auth_config().jwt_secret, algorithm=get_auth_config().jwt_alg
    )


def decode_token(token):
    try:
        payload = jwt.decode(
            token, get_auth_config().jwt_secret, algorithms=[get_auth_config().jwt_alg]
        )
        return payload  # payload["sub"], payload["role"]
    except (JWTError, ValidationError):
        raise InvalidCredentials
    except Exception as e:
        logger.exception(e)
        raise DetailedHTTPException()
