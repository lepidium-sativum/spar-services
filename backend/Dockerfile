# -------------------------------
# STAGE-1: BASE-BUILD IMAGE WITH BACKEND
# Build backend dependencies and install them
# -------------------------------
FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim AS requirements-stage

WORKDIR /tmp

RUN apt-get update \
    && apt-get -y install --no-install-recommends libpq-dev libpq5 gcc python3-dev build-essential

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project

# -------------------------------
# STAGE-2: BASE BUILD
# -------------------------------
FROM python:3.11-slim-bookworm AS app

WORKDIR /backend

# Install FFMPEG and Postgres connector dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
    libpq5 \
    ffmpeg \
    openssh-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy packages/virtualenv from the previous stage (requirements-stage)
COPY --from=requirements-stage /tmp/.venv /backend/.venv
ENV PATH="/backend/.venv/bin:$PATH"

# set env variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Copy the remaining application code (this should be done after dependencies for faster builds)
COPY app ./app
COPY *.py .
COPY alembic.ini /backend/alembic.ini
COPY migrations ./migrations


# Run server
CMD ["python", "-m", "gunicorn", "-c", "gunicorn_conf.py", "app.main:create_app"] 

