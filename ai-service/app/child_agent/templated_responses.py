import random

from app.child_state_engine.models import TurnOutcome
from app.curriculum.models import CurriculumTopicDTO

_CLARIFICATION_PHRASES = [
    "Wait, can you say that again?",
    "I don't get it... can you show me?",
]

_DISTRACTED_PHRASES = [
    "...",
    "Can I go play now?",
]

_FALLBACK_RESPONSES = {
    TurnOutcome.CORRECT: "I think that's right.",
    TurnOutcome.INCORRECT: "Hmm, I'm not sure.",
    TurnOutcome.NEEDS_CLARIFICATION: "Can you say that again?",
    TurnOutcome.DISTRACTED: "...",
}


def generate_response_text(outcome: TurnOutcome, topic: CurriculumTopicDTO) -> str:
    if outcome == TurnOutcome.CORRECT:
        if topic.acceptable_answers:
            return f"Um, I think it's {topic.acceptable_answers[0]}!"
        return "I know this one!"

    if outcome == TurnOutcome.INCORRECT:
        if topic.common_misconceptions:
            return topic.common_misconceptions[0]
        return "I'm not sure... is it this one?"

    if outcome == TurnOutcome.NEEDS_CLARIFICATION:
        return random.choice(_CLARIFICATION_PHRASES)

    return random.choice(_DISTRACTED_PHRASES)


def generate_fallback_response(outcome: TurnOutcome) -> str:
    """Validasiya uğursuz olduqda istifadə olunan, həmişə təhlükəsiz cavab."""
    return _FALLBACK_RESPONSES[outcome]