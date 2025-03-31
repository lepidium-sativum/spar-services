# Spar: AI Avatars – Streaming UE Metahumans with custom LLM for real-time interaction

[Watch the Spar Demo Video](https://vimeo.com/1053692327/7ef043b6a9)

## Project Setup

**Prerequisites**: Ensure you have Docker and Docker Compose installed.

- Create a `.env` file in each subfolder based on the provided `.env.example`.
- To populate the database initially, uncomment the code in `backend/app/dummy/mock_db_data.py`. After the initial run, comment the code again.

## Running Services

Run:
```bash
docker compose -f docker-compose.dev.yml up -d --build 
```
to start the services.

**Note**: By default, this setup uses vLLM, which requires GPU support. If you're not using a GPU, disable the `vllm` service in your `docker-compose.dev.yml`.

Access applications locally at:

- Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Admin Panel: [http://localhost:5174](http://localhost:5174)
- Sales App: [http://localhost:5173](http://localhost:5173)

## vLLM Configuration

Currently using the vanilla `Qwen2.5-0.5B-Instruct` model.

**Enabling LoRA adapters**:
- Update the `docker-compose.dev.yml` file.
- Provide a path containing `adapter_config.json` and `adapter_model.safetensors`.

## Contact Information

Reach out for resources and assistance:

- [Anthony Malkoun](https://www.linkedin.com/in/anthony-malkoun/): Repository and general codebase inquiries.
- [Prakhar Saxena](https://www.linkedin.com/in/prakhar-saxena-47434a196/): LLM fine-tuning queries.
- [Gulshan Sankhyan](https://www.linkedin.com/in/gulshan-sankhyan/): UE blueprint-related questions.
- [Henry Obegi](https://www.linkedin.com/in/henryobegi/): Other general inquiries.
