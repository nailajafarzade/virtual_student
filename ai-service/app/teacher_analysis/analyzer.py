from typing import List, Optional

from app.child_state_engine.models import TurnOutcome
from app.teacher_analysis import signals


def analyze(
    teacher_utterance: str,
    previous_outcome: Optional[TurnOutcome],
    previous_child_response: Optional[str],
    speech_duration_seconds: Optional[float],
) -> List[dict]:
    """{signal_type, value} siyahısı qaytarır. Tətbiq olunmayan siqnallar buraxılır."""
    results: List[dict] = []

    def add(signal_type: str, value) -> None:
        if value is None:
            return
        results.append({"signal_type": signal_type, "value": str(value)})

    add("is_question", signals.is_question(teacher_utterance))
    add("question_type", signals.classify_question_type(teacher_utterance))
    add("encouragement_detected", signals.detect_encouragement(teacher_utterance))
    add("checks_understanding", signals.detect_checks_understanding(teacher_utterance))
    add("addresses_mistake", signals.detect_addresses_mistake(teacher_utterance, previous_outcome))
    add("redirects_attention", signals.detect_redirects_attention(teacher_utterance, previous_outcome))
    add("is_follow_up", signals.detect_follow_up(teacher_utterance, previous_child_response))
    add("word_count", signals.word_count(teacher_utterance))
    add("speech_duration_seconds", speech_duration_seconds)

    return results