import logging
import threading
from dataclasses import dataclass
from typing import BinaryIO, Optional

from faster_whisper import WhisperModel

from app.config import settings

logger = logging.getLogger(__name__)

_model: Optional[WhisperModel] = None
_lock = threading.Lock()


@dataclass
class TranscriptionResult:
    text: str
    duration_seconds: float


def load_model() -> None:
    global _model
    with _lock:
        if _model is not None:
            return
        logger.info(
            "Loading Whisper model '%s' (device=%s, compute_type=%s)... "
            "First run downloads the model from Hugging Face Hub.",
            settings.whisper_model_size, settings.whisper_device, settings.whisper_compute_type,
        )
        _model = WhisperModel(
            settings.whisper_model_size,
            device=settings.whisper_device,
            compute_type=settings.whisper_compute_type,
        )
        logger.info("Whisper model loaded.")


def is_loaded() -> bool:
    return _model is not None


def transcribe(audio_file: BinaryIO) -> TranscriptionResult:
    if _model is None:
        raise RuntimeError("Whisper model is not loaded yet.")

    segments, info = _model.transcribe(
        audio_file, language="en", beam_size=1, vad_filter=True
    )
    text = " ".join(segment.text.strip() for segment in segments).strip()
    return TranscriptionResult(text=text, duration_seconds=info.duration)