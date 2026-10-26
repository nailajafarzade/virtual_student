from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.child_turn import router as child_turn_router
from app.api.health import router as health_router
from app.api.stt import router as stt_router
from app.api.teacher_analysis import router as teacher_analysis_router
from app.api.tts import router as tts_router
from app.stt import transcriber


@asynccontextmanager
async def lifespan(app: FastAPI):
    transcriber.load_model()
    yield


app = FastAPI(title="Virtual Student AI Service", version="0.0.1", lifespan=lifespan)

app.include_router(child_turn_router)
app.include_router(health_router)
app.include_router(stt_router)
app.include_router(tts_router)
app.include_router(teacher_analysis_router)
