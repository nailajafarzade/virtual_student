from enum import Enum
from typing import Dict

from pydantic import Field

from app.common.camel_model import CamelModel

DEFAULT_INITIAL_KNOWLEDGE = 0.3


class EmotionalState(str, Enum):
    NEUTRAL = "neutral"
    CONFIDENT = "confident"
    CURIOUS = "curious"
    SHY = "shy"
    FRUSTRATED = "frustrated"
    TIRED = "tired"


class TurnOutcome(str, Enum):
    CORRECT = "correct"
    INCORRECT = "incorrect"
    NEEDS_CLARIFICATION = "needs_clarification"
    DISTRACTED = "distracted"


class ChildState(CamelModel):
    """Virtual uşağın müəyyən andakı tam vəziyyəti."""

    attention: float = 0.8
    engagement: float = 0.8
    confidence: float = 0.6
    motivation: float = 0.7
    curiosity: float = 0.6
    frustration: float = 0.1
    fatigue: float = 0.0
    emotional_state: EmotionalState = EmotionalState.NEUTRAL

    # topic_id -> proficiency (0..1)
    topic_knowledge: Dict[int, float] = Field(default_factory=dict)

    consecutive_correct: int = 0
    consecutive_incorrect: int = 0
    turn_count: int = 0

    def knowledge_for(self, topic_id: int) -> float:
        return self.topic_knowledge.get(topic_id, DEFAULT_INITIAL_KNOWLEDGE)