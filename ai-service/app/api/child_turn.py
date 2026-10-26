import logging
from typing import List, Optional

from fastapi import APIRouter

from app.child_agent.child_agent import produce_child_response
from app.child_agent.models import ConversationTurn
from app.child_state_engine.engine import apply_outcome, decide_turn_outcome
from app.child_state_engine.models import ChildState, TurnOutcome
from app.common.camel_model import CamelModel
from app.curriculum.models import CurriculumTopicDTO

logger = logging.getLogger(__name__)

router = APIRouter()


class ChildTurnRequest(CamelModel):
    session_id: int
    turn_sequence_no: int
    teacher_utterance: str
    curriculum_topic: CurriculumTopicDTO
    current_state: Optional[ChildState] = None
    # Əvvəlki növbələr (köhnədən yeniyə). Göndərilməsə, kontekstsiz işləyir.
    recent_turns: List[ConversationTurn] = []


class ChildTurnResponse(CamelModel):
    child_response_text: str
    outcome: TurnOutcome
    updated_state: ChildState
    validation_passed: bool


@router.post("/internal/child-turn", response_model=ChildTurnResponse, response_model_by_alias=True)
def child_turn(request: ChildTurnRequest) -> ChildTurnResponse:
    current_state = request.current_state or ChildState()
    topic = request.curriculum_topic

    outcome = decide_turn_outcome(current_state, topic.id)
    updated_state = apply_outcome(current_state, topic.id, outcome)

    response_text, validation_passed = produce_child_response(
        outcome, updated_state, topic, request.teacher_utterance, request.recent_turns
    )

    if not validation_passed:
        logger.warning(
            "Turn used fallback response (session=%s turn=%s outcome=%s)",
            request.session_id, request.turn_sequence_no, outcome.value,
        )

    return ChildTurnResponse(
        child_response_text=response_text,
        outcome=outcome,
        updated_state=updated_state,
        validation_passed=validation_passed,
    )