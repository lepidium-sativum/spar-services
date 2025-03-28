# Spar Services

Setup:

This project requires docker and docker compose. Before running the services, make sure you have the following:

- Under each subfolder, setup a .env based on the .env.example file.
- To populate the database with data, uncomment the code in backend/app/dummy/mock_db_data.py. Make sure to comment it out after running the services.

# Running the services

Run `docker compose -f docker-compose.dev.yml up -d --build` to start the services.

**Note: This will run vLLM, which assumes you have a GPU.** If you do not want to run vLLM locally, comment out the vllm service in the docker compose file.

You can access the swagger UI at http://localhost:8000/docs, the admin panel at http://localhost:5174, and the sales app at http://localhost:5173.

# Using vLLM

The current configuration in the docker compose file uses vLLM with a vanilla model (Qwen2.5-0.5B-Instruct).

Contact us for access to our own training data, training scripts, and the fine-tuned model.

### Enabling Lora

See comments under the command for the vllm service in docker compose file. Must set a path to a folder containing the adapter_config.json file and the adapter_model.safetensors file.
