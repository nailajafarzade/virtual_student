import io

import av
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.common.camel_model import CamelModel
from app.stt import transcriber

router = APIRouter()


class SttResponse(CamelModel):
    transcribed_text: str
    duration_seconds: float


@router.post("/internal/stt", response_model=SttResponse, response_model_by_alias=True)
def speech_to_text(audio: UploadFile = File(...)) -> SttResponse:
    if not transcriber.is_loaded():
        raise HTTPException(status_code=503, detail="Whisper model is still loading, try again shortly.")

    audio_bytes = audio.file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")

    try:
        result = transcriber.transcribe(io.BytesIO(audio_bytes))
    except av.error.FFmpegError:
        raise HTTPException(status_code=400, detail="Could not decode the uploaded audio file.")
    if not result.text:
        raise HTTPException(status_code=422, detail="Could not transcribe any speech from the audio.")

    return SttResponse(transcribed_text=result.text, duration_seconds=result.duration_seconds)