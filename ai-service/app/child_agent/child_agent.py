import logging
from typing import List, Optional, Tuple

from app.child_agent.llm_agent import generate_child_response
from app.child_agent.models import ConversationTurn
from app.child_agent.templated_responses import generate_fallback_response, generate_response_text
from app.child_state_engine.models import ChildState, TurnOutcome
from app.config import settings
from app.curriculum.models import CurriculumTopicDTO
from app.llm_runtime.ollama_client import LlmGenerationError, LlmUnavailableError
from app.response_validator.validator import validate_response

logger = logging.getLogger(__name__)


def produce_child_response(
    outcome: TurnOutcome,
    state: ChildState,
    topic: CurriculumTopicDTO,
    teacher_utterance: str,
    history: Optional[List[ConversationTurn]] = None,
) -> Tuple[str, bool]:
    """(response_text, validation_passed) qaytarır. validation_passed=False yalnız fallback işlədildikdə."""
    if not settings.llm_enabled:
        return _template_path(outcome, state, topic)
    return _llm_path(outcome, state, topic, teacher_utterance, history)


def _template_path(outcome, state, topic) -> Tuple[str, bool]:
    text = generate_response_text(outcome, topic)
    result = validate_response(text, outcome, topic, state)
    if result.is_valid:
        return text, True
    logger.warning("Template response failed validation (unexpected): %s", result.issues)
    return generate_fallback_response(outcome), False


def _llm_path(outcome, state, topic, teacher_utterance, history) -> Tuple[str, bool]:
    text = _attempt_llm(outcome, state, topic, teacher_utterance, history, correction_notes=None)
    if text is not None:
        result = validate_response(text, outcome, topic, state)
        if result.is_valid:
            return text, True

        logger.info("LLM response failed validation, retrying with feedback: %s", result.issues)
        text = _attempt_llm(outcome, state, topic, teacher_utterance, history, correction_notes=result.issues)
        if text is not None:
            result = validate_response(text, outcome, topic, state)
            if result.is_valid:
                return text, True
            logger.warning("LLM retry also failed validation: %s", result.issues)

    logger.warning("Falling back to fixed response for outcome=%s", outcome.value)
    return generate_fallback_response(outcome), False


def _attempt_llm(outcome, state, topic, teacher_utterance, history, correction_notes) -> Optional[str]:
    try:
        return generate_child_response(outcome, state, topic, teacher_utterance, correction_notes, history)
    except LlmUnavailableError as exc:
        logger.error("LLM unavailable: %s", exc)
        return None
    except LlmGenerationError as exc:
        logger.error("LLM generation error: %s", exc)
        return None