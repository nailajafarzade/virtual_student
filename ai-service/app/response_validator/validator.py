from dataclasses import dataclass, field
from typing import List

from app.child_state_engine.models import ChildState, TurnOutcome
from app.curriculum.models import CurriculumTopicDTO
from app.response_validator.rules import ALL_RULES


@dataclass
class ValidationResult:
    is_valid: bool
    issues: List[str] = field(default_factory=list)


def validate_response(text: str, outcome: TurnOutcome, topic: CurriculumTopicDTO, state: ChildState) -> ValidationResult:
    issues = [issue for rule in ALL_RULES if (issue := rule(text, outcome, topic, state))]
    return ValidationResult(is_valid=len(issues) == 0, issues=issues)