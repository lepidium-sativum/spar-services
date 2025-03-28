# Spar Services

Setup:

- Under each subfolder, setup a .env based on the .env.example file.
- Run `docker compose -f docker-compose.dev.yml up -d --build` to start the services.

# Enabling Lora

See comments under the command for the vllm service in docker compose file. Must set a path to a folder containing the adapter_config.json file and the adapter_model.safetensors file.
