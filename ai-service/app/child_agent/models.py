from app.common.camel_model import CamelModel


class ConversationTurn(CamelModel):
    """Sessiyanın əvvəlki bir növbəsi — follow-up suallar üçün kontekst."""

    teacher_utterance: str
    child_response_text: str
