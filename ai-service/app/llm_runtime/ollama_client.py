import logging
from typing import Optional

import requests

from app.config import settings

logger = logging.getLogger(__name__)


class LlmUnavailableError(Exception):
    """Ollama-ya çatmaq mümkün olmadı və ya vaxt bitdi."""


class LlmGenerationError(Exception):
    """Ollama cavab verdi, amma generasiya uğursuz oldu və ya boş qayıtdı."""


def generate(
    prompt: str,
    system: Optional[str] = None,
    max_tokens: Optional[int] = None,
    temperature: float = 0.7,
) -> str:
    payload = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": max_tokens or settings.llm_max_tokens,
            "temperature": temperature,
            "stop": ["\nTeacher:", "\nChild:", "\n\n"],
        },
    }
    if system:
        payload["system"] = system
    if settings.ollama_num_gpu is not None:
        payload["options"]["num_gpu"] = settings.ollama_num_gpu

    try:
        response = requests.post(
            f"{settings.ollama_base_url}/api/generate",
            json=payload,
            timeout=settings.ollama_timeout_seconds,
        )
    except requests.exceptions.RequestException as exc:
        raise LlmUnavailableError(f"Could not reach Ollama at {settings.ollama_base_url}: {exc}") from exc

    if response.status_code != 200:
        raise LlmGenerationError(f"Ollama returned status {response.status_code}: {response.text[:200]}")

    text = response.json().get("response", "").strip()
    if not text:
        raise LlmGenerationError("Ollama returned an empty response.")
    return text
