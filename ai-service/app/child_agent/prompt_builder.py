from typing import List, Optional

from app.child_agent.models import ConversationTurn
from app.child_state_engine.models import ChildState, EmotionalState, TurnOutcome
from app.curriculum.models import CurriculumTopicDTO

SYSTEM_PREAMBLE = (
    "You are simulating the speech of a real 5-to-6-year-old preschool child "
    "during a one-on-one math lesson, for a teacher-training tool. Reply with "
    "ONLY what the child says out loud — one short sentence, occasionally two. "
    "Use simple words a young child would use. No stage directions, no "
    "quotation marks, no narration, no emoji, no asterisks. "
    "The child only knows what a typical 5-to-6-year-old knows (counting "
    "small numbers, simple shapes, more and fewer). Always respond to what "
    "the teacher actually just said, and stay consistent with what the "
    "child said earlier in the conversation."
)

# Son neçə növbə prompt-a daxil edilir — kiçik model üçün konteksti qısa saxlayır.
MAX_HISTORY_TURNS = 4

_OUTCOME_INSTRUCTIONS = {
    TurnOutcome.CORRECT: (
        "The child has figured out the right answer to the teacher's question. "
        "Work out that answer from what the teacher said and have the child "
        "state it, a little hesitantly, the way a young child would."
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
    history: Optional[List[ConversationTurn]] = None,
) -> str:
    lines = [f"Topic: {topic.name} — {topic.objective}"]

    recent = (history or [])[-MAX_HISTORY_TURNS:]
    if recent:
        lines.append("")
        lines.append("Conversation so far:")
        for turn in recent:
            lines.append(f"Teacher: {turn.teacher_utterance}")
            lines.append(f"Child: {turn.child_response_text}")

    lines += [
        "",
        f'Teacher just said: "{teacher_utterance}"',
        "",
        _OUTCOME_INSTRUCTIONS[outcome],
        _EMOTION_TONE_HINTS[state.emotional_state],
        "If the teacher did not ask a question or give a task (for example a "
        "greeting, praise, or chit-chat), ignore the answer instruction above "
        "and just react briefly and naturally to what the teacher said.",
        "If the question is too hard for a 5-to-6-year-old (for example big "
        "numbers, multiplication, reading, or grown-up topics), the child "
        "does not know the answer and says so simply.",
    ]

    if outcome == TurnOutcome.CORRECT and topic.acceptable_answers:
        lines.append(
            "Examples of right answers for this topic: "
            + ", ".join(f'"{a}"' for a in topic.acceptable_answers)
            + " — use whichever actually fits the teacher's question."
        )

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