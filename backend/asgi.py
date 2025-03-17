import uvicorn
from app.main import create_app
from app.core.config import get_base_config

api = create_app()

if __name__ == "__main__":
    uvicorn.run("asgi:api", host="0.0.0.0", port=get_base_config().server_port, reload=True)
