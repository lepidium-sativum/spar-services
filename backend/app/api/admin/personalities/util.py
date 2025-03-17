import json
from pathlib import Path

MODEL_FILE_PATH = Path(__file__).parent
STATIC_FOLDER_PATH = MODEL_FILE_PATH / "static"


def read_file(file_name):
    JSON_FILE_PATH = STATIC_FOLDER_PATH / file_name
    if not JSON_FILE_PATH.exists():
        raise FileNotFoundError(f"JSON file not found: {JSON_FILE_PATH}")
    with open(JSON_FILE_PATH, "r") as file:
        return json.load(file)
