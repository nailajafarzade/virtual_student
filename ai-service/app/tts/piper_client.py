import logging

import requests

from app.config import settings

logger = logging.getLogger(__name__)


class TtsUnavailableError(Exception):
    """Piper HTTP serverinə çatmaq mümkün olmadı."""


class TtsGenerationError(Exception):
    """Piper cavab verdi, amma səs yaratmadı."""


def synthesize(text: str) -> bytes:
    try:
        response = requests.post(
            settings.piper_base_url,
            headers={"Content-Type": "text/plain"},
            data=text.encode("utf-8"),
            timeout=settings.piper_timeout_seconds,
        )
    except requests.exceptions.RequestException as exc:
        raise TtsUnavailableError(f"Could not reach Piper at {settings.piper_base_url}: {exc}") from exc

    if response.status_code != 200:
        raise TtsGenerationError(f"Piper returned status {response.status_code}: {response.text[:200]}")

    if not response.content:
        raise TtsGenerationError("Piper returned empty audio.")

    return response.content