from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.common.camel_model import CamelModel
from app.tts import piper_client
from app.tts.piper_client import TtsGenerationError, TtsUnavailableError

router = APIRouter()


class TtsRequest(CamelModel):
    text: str


@router.post("/internal/tts")
def text_to_speech(request: TtsRequest) -> Response:
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="No text provided to synthesize.")

    try:
        audio_bytes = piper_client.synthesize(request.text)
    except TtsUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except TtsGenerationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return Response(content=audio_bytes, media_type="audio/wav")