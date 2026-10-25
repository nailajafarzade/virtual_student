from typing import List, Optional

from app.child_state_engine.models import ChildState, EmotionalState, TurnOutcome
from app.curriculum.models import CurriculumTopicDTO

SYSTEM_PREAMBLE = (
    "You are simulating the speech of a real 5-to-6-year-old preschool child "
    "during a one-on-one math lesson, for a teacher-training tool. Reply with "
    "ONLY what the child says out loud — one short sentence, occasionally two. "
    "Use simple words a young child would use. No stage directions, no "
    "quotation marks, no narration, no emoji, no asterisks."
)

_OUTCOME_INSTRUCTIONS = {
    TurnOutcome.CORRECT: (
        "The child has figured out the right answer. Have them state it, "
        "a little hesitantly, the way a young child would."
    ),
    TurnOutcome.INCORRECT: (
        "The child gives a wrong answer, reflecting a common mistake a "
        "child this age makes on this topic. Do NOT state the correct answer."
    ),
    TurnOutcome.NEEDS_CLARIFICATION: (
        "The child does not understand the question and asks the teacher "
        "to repeat or explain it differently. Do NOT attempt an answer."
    ),
    TurnOutcome.DISTRACTED: (
        "The child is distracted and not really engaging with the question "
        "right now. Keep it very short and vague — do NOT attempt an answer."
    ),
}

_EMOTION_TONE_HINTS = {
    EmotionalState.CONFIDENT: "Sound cheerful and sure of themselves.",
    EmotionalState.CURIOUS: "Sound curious and interested.",
    EmotionalState.SHY: "Sound quiet and a little unsure, using few words.",
    EmotionalState.FRUSTRATED: "Sound a little frustrated or whiny, not cheerful.",
    EmotionalState.TIRED: "Sound tired, with short, low-energy phrasing.",
    EmotionalState.NEUTRAL: "Keep the tone plain and matter-of-fact.",
}


def build_prompt(
    outcome: TurnOutcome,
    state: ChildState,
    topic: CurriculumTopicDTO,
    teacher_utterance: str,
    correction_notes: Optional[List[str]] = None,
) -> str:
    lines = [
        f"Topic: {topic.name} — {topic.objective}",
        f'Teacher just said: "{teacher_utterance}"',
        "",
        _OUTCOME_INSTRUCTIONS[outcome],
        _EMOTION_TONE_HINTS[state.emotional_state],
    ]

    if outcome == TurnOutcome.INCORRECT and topic.common_misconceptions:
        lines.append(
            f'A believable wrong answer for this topic: "{topic.common_misconceptions[0]}" '
            "— you may use this or something similar in spirit."
        )

    if correction_notes:
        lines.append("")
        lines.append("Your previous attempt was rejected for these reasons — fix them:")
        for note in correction_notes:
            lines.append(f"- {note}")

    lines.append("")
    lines.append("Child's response:")
    return "\n".join(lines)