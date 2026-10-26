import re
from typing import List, Optional

from app.child_agent.models import ConversationTurn
from app.child_agent.prompt_builder import SYSTEM_PREAMBLE, build_prompt
from app.child_state_engine.models import ChildState, TurnOutcome
from app.curriculum.models import CurriculumTopicDTO
from app.llm_runtime import ollama_client

_SPEAKER_LABEL = re.compile(r"^\s*(child'?s response|child|lumi)\s*:\s*", re.IGNORECASE)
_STAGE_DIRECTION = re.compile(r"\*[^*]*\*|\([^)]*\)|\[[^\]]*\]")


def _clean(text: str) -> str:
    # Model bəzən "Child:" etiketini təkrarlayır, *giggles* kimi səhnə qeydləri və ya əlavə sətirlər yazır.
    lines = [line for line in text.strip().splitlines() if line.strip()]
    text = lines[0] if lines else ""
    text = _SPEAKER_LABEL.sub("", text)
    text = _STAGE_DIRECTION.sub("", text)
    text = re.sub(r"\s{2,}", " ", text).strip()
    if len(text) >= 2 and text[0] in "\"'" and text[-1] in "\"'":
        text = text[1:-1].strip()
    return text


def generate_child_response(
    outcome: TurnOutcome,
    state: ChildState,
    topic: CurriculumTopicDTO,
    teacher_utterance: str,
    correction_notes: Optional[List[str]] = None,
    history: Optional[List[ConversationTurn]] = None,
) -> str:
    prompt = build_prompt(outcome, state, topic, teacher_utterance, correction_notes, history)
    raw = ollama_client.generate(prompt, system=SYSTEM_PREAMBLE)
    return _clean(raw)
