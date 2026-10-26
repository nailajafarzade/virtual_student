import re
from typing import Callable, List, Optional

from app.child_state_engine.models import ChildState, EmotionalState, TurnOutcome
from app.curriculum.models import CurriculumTopicDTO

MAX_WORD_COUNT = 25
MAX_CHAR_COUNT = 160
DISTRACTED_MAX_WORD_COUNT = 8

FORBIDDEN_WORDS = {"stupid", "hate", "kill", "die", "shut up", "dumb"}

CLARIFICATION_MARKERS = ("?", "say that again", "show me", "don't get", "dont get", "what do you mean")


def _word_count(text: str) -> int:
    return len(text.split())


def rule_not_empty(text: str, outcome: TurnOutcome, topic: CurriculumTopicDTO, state: ChildState) -> Optional[str]:
    if not text or not text.strip():
        return "Response is empty."
    return None


def rule_max_length(text: str, outcome: TurnOutcome, topic: CurriculumTopicDTO, state: ChildState) -> Optional[str]:
    if _word_count(text) > MAX_WORD_COUNT:
        return f"Response exceeds {MAX_WORD_COUNT} words (age-appropriateness)."
    if len(text) > MAX_CHAR_COUNT:
        return f"Response exceeds {MAX_CHAR_COUNT} characters (age-appropriateness)."
    return None


def rule_forbidden_content(text: str, outcome: TurnOutcome, topic: CurriculumTopicDTO, state: ChildState) -> Optional[str]:
    lowered = text.lower()
    for word in FORBIDDEN_WORDS:
        if word in lowered:
            return f"Response contains disallowed content ('{word}')."
    return None


def _contains_phrase(text: str, phrase: str) -> bool:
    # Söz sərhədi ilə: "5" "15"-in içində, "one" "someone"-un içində tapılmamalıdır.
    return re.search(rf"(?<!\w){re.escape(phrase.lower())}(?!\w)", text.lower()) is not None


def rule_answer_leak(text: str, outcome: TurnOutcome, topic: CurriculumTopicDTO, state: ChildState) -> Optional[str]:
    if outcome not in (TurnOutcome.INCORRECT, TurnOutcome.DISTRACTED):
        return None
    for answer in topic.acceptable_answers:
        # Kurikulumun öz yanlış cavab nümunəsində işlənən cavab (məs. "square") sızma sayılmır.
        if outcome == TurnOutcome.INCORRECT and any(
            _contains_phrase(m, answer) for m in topic.common_misconceptions
        ):
            continue
        if _contains_phrase(text, answer):
            return f"Outcome is {outcome.value} but response states the acceptable answer '{answer}'."
    return None


def rule_clarification_shape(text: str, outcome: TurnOutcome, topic: CurriculumTopicDTO, state: ChildState) -> Optional[str]:
    if outcome != TurnOutcome.NEEDS_CLARIFICATION:
        return None
    lowered = text.lower()
    if any(marker in lowered for marker in CLARIFICATION_MARKERS):
        return None
    return "Outcome is needs_clarification but response doesn't read as a clarification request."


def rule_distracted_brevity(text: str, outcome: TurnOutcome, topic: CurriculumTopicDTO, state: ChildState) -> Optional[str]:
    if outcome != TurnOutcome.DISTRACTED:
        return None
    if _word_count(text) > DISTRACTED_MAX_WORD_COUNT:
        return f"Outcome is distracted but response is longer than {DISTRACTED_MAX_WORD_COUNT} words."
    return None


def rule_frustrated_tone(text: str, outcome: TurnOutcome, topic: CurriculumTopicDTO, state: ChildState) -> Optional[str]:
    if outcome != TurnOutcome.CORRECT or state.emotional_state != EmotionalState.FRUSTRATED:
        return None
    if "!" in text:
        return "Emotional state is frustrated but a correct-answer response uses a cheerful tone ('!')."
    return None


ALL_RULES: List[Callable[[str, TurnOutcome, CurriculumTopicDTO, ChildState], Optional[str]]] = [
    rule_not_empty,
    rule_max_length,
    rule_forbidden_content,
    rule_answer_leak,
    rule_clarification_shape,
    rule_distracted_brevity,
    rule_frustrated_tone,
]