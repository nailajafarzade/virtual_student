from typing import List

from pydantic import Field

from app.common.camel_model import CamelModel


class CurriculumTopicDTO(CamelModel):
    id: int
    name: str
    objective: str
    example_questions: List[str] = Field(default_factory=list)
    acceptable_answers: List[str] = Field(default_factory=list)
    common_misconceptions: List[str] = Field(default_factory=list)