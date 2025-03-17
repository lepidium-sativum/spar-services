# spar-api-oss

## Running locally:

### Postgres:

```bash
docker run -d -p 5432:5432 --name spar-postgres -e POSTGRES_PASSWORD=sp@RHenry -e POSTGRES_DB=sparmvp -e POSTGRES_USER=postgres -v pgdata:/var/lib/postgresql/data postgres:16-alpine
```

### Redis:

```bash
docker run -d -p 6379:6379 --name spar-redis redis:7-alpine
```

You may wish to use redis-stack for debugging, it will display the data at port 8001.

```bash
docker run -d -p 6379:6379 -p 8001:8001 --name spar-redis redis/redis-stack:latest
```

### Server:

```bash
uv sync  # run once to install dependencies
python asgi.py
```

Or with docker:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

### Useful Alembic commands:

```bash
alembic revision --autogenerate -m "<migration name>"
alembic current
alembic history
alembic upgrade head
alembic downgrade -1
```

### Optional: adding initial data

If running for the first time, you need to create the database and tables:

- Uncomment stuff in dummy_data (app/dummy/mock_db_data.py)
- Run the server
- Comment stuff in dummy_data
