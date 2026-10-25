from typing import List, Optional

from fastapi import APIRouter

from app.child_state_engine.models import TurnOutcome
from app.common.camel_model import CamelModel
from app.teacher_analysis.analyzer import analyze

router = APIRouter()


class TeacherAnalysisRequest(CamelModel):
    teacher_utterance: str
    previous_outcome: Optional[TurnOutcome] = None
    previous_child_response: Optional[str] = None
    speech_duration_seconds: Optional[float] = None


class TeacherSignalDTO(CamelModel):
    signal_type: str
    value: str


class TeacherAnalysisResponse(CamelModel):
    signals: List[TeacherSignalDTO]


@router.post("/internal/teacher-analysis", response_model=TeacherAnalysisResponse, response_model_by_alias=True)
def teacher_analysis(request: TeacherAnalysisRequest) -> TeacherAnalysisResponse:
    raw_signals = analyze(
        request.teacher_utterance,
        request.previous_outcome,
        request.previous_child_response,
        request.speech_duration_seconds,
    )
    return TeacherAnalysisResponse(signals=[TeacherSignalDTO(**s) for s in raw_signals])