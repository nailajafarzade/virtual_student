import os


class Settings:
    llm_enabled: bool = os.environ.get("LLM_ENABLED", "true").lower() == "true"
    ollama_base_url: str = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model: str = os.environ.get("OLLAMA_MODEL", "llama3.2:3b")
    ollama_timeout_seconds: float = float(os.environ.get("OLLAMA_TIMEOUT_SECONDS", "30"))
    llm_max_tokens: int = int(os.environ.get("LLM_MAX_TOKENS", "60"))

    whisper_model_size: str = os.environ.get("WHISPER_MODEL_SIZE", "tiny")
    whisper_device: str = os.environ.get("WHISPER_DEVICE", "cpu")
    whisper_compute_type: str = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")

    piper_base_url: str = os.environ.get("PIPER_BASE_URL", "http://localhost:5001")
    piper_timeout_seconds: float = float(os.environ.get("PIPER_TIMEOUT_SECONDS", "15"))


settings = Settings()