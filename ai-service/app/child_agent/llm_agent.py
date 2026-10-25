from typing import List, Optional

from app.child_agent.prompt_builder import SYSTEM_PREAMBLE, build_prompt
from app.child_state_engine.models import ChildState, TurnOutcome
from app.curriculum.models import CurriculumTopicDTO
from app.llm_runtime import ollama_client


def _clean(text: str) -> str:
    text = text.strip()
    if len(text) >= 2 and text[0] in "\"'" and text[-1] in "\"'":
        text = text[1:-1].strip()
    return text


def generate_child_response(
    outcome: TurnOutcome,
    state: ChildState,
    topic: CurriculumTopicDTO,
    teacher_utterance: str,
    correction_notes: Optional[List[str]] = None,
) -> str:
    prompt = build_prompt(outcome, state, topic, teacher_utterance, correction_notes)
    raw = ollama_client.generate(prompt, system=SYSTEM_PREAMBLE)
    return _clean(raw)