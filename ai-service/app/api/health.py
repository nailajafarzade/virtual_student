import time
from datetime import datetime, timezone

from fastapi import APIRouter

from app.config import settings
from app.llm_runtime import ollama_client
from app.llm_runtime.ollama_client import LlmGenerationError, LlmUnavailableError
from app.stt import transcriber
from app.tts import piper_client
from app.tts.piper_client import TtsGenerationError, TtsUnavailableError

router = APIRouter()


@router.get("/internal/health")
def health() -> dict:
    return {
        "status": "UP",
        "service": "virtual-student-ai-service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/internal/health/llm")
def llm_health() -> dict:
    if not settings.llm_enabled:
        return {"status": "DISABLED", "model": settings.ollama_model}

    start = time.monotonic()
    try:
        text = ollama_client.generate("Say hello in exactly three words.", max_tokens=20)
        return {
            "status": "UP",
            "model": settings.ollama_model,
            "sample_response": text,
            "elapsed_seconds": round(time.monotonic() - start, 2),
        }
    except (LlmUnavailableError, LlmGenerationError) as exc:
        return {
            "status": "DOWN",
            "model": settings.ollama_model,
            "error": str(exc),
            "elapsed_seconds": round(time.monotonic() - start, 2),
        }


@router.get("/internal/health/stt")
def stt_health() -> dict:
    return {
        "status": "UP" if transcriber.is_loaded() else "LOADING",
        "model": settings.whisper_model_size,
        "device": settings.whisper_device,
        "compute_type": settings.whisper_compute_type,
    }


@router.get("/internal/health/tts")
def tts_health() -> dict:
    start = time.monotonic()
    try:
        audio = piper_client.synthesize("Testing.")
        return {
            "status": "UP",
            "base_url": settings.piper_base_url,
            "audio_bytes": len(audio),
            "elapsed_seconds": round(time.monotonic() - start, 2),
        }
    except (TtsUnavailableError, TtsGenerationError) as exc:
        return {
            "status": "DOWN",
            "base_url": settings.piper_base_url,
            "error": str(exc),
            "elapsed_seconds": round(time.monotonic() - start, 2),
        }