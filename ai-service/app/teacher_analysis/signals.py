import re
from typing import Optional

from app.child_state_engine.models import TurnOutcome

_OPEN_QUESTION_STARTERS = (
    "what", "why", "how", "describe", "explain", "tell me", "tell us",
)
_CLOSED_QUESTION_STARTERS = (
    "is", "are", "do", "does", "did", "can", "could", "would", "will",
    "was", "were", "has", "have",
)

_ENCOURAGEMENT_PHRASES = (
    "good job", "well done", "great job", "nice work", "that's right",
    "you got it", "excellent", "good try", "nice try", "you can do it",
    "great thinking", "well tried", "good thinking", "way to go",
    "awesome", "fantastic",
)

_CHECKS_UNDERSTANDING_PHRASES = (
    "does that make sense", "do you understand", "does this make sense",
    "make sense", "understand so far", "any questions", "clear so far",
)

_ADDRESSES_MISTAKE_PHRASES = (
    "let's try again", "let's try that again", "close", "almost",
    "not quite", "let's look at", "that's okay", "that's ok",
    "no worries", "let's think about", "good try",
)

_REDIRECTS_ATTENTION_PHRASES = (
    "look here", "look at this", "focus", "let's focus", "pay attention",
    "eyes here", "eyes on", "look at me", "let's look",
)

_STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "do", "does", "did",
    "you", "your", "i", "we", "how", "what", "why", "many", "to", "of",
    "it", "this", "that", "and", "or", "in", "on", "at", "can", "see",
}


def _normalize(text: str) -> str:
    return text.strip().lower()


def is_question(text: str) -> bool:
    return text.strip().endswith("?")


def classify_question_type(text: str) -> str:
    """'open', 'closed' və ya 'not_a_question' qaytarır."""
    if not is_question(text):
        return "not_a_question"

    normalized = _normalize(text)
    words = normalized.split()
    first_word = words[0] if words else ""

    if any(normalized.startswith(starter) for starter in _OPEN_QUESTION_STARTERS):
        return "open"
    if first_word in _CLOSED_QUESTION_STARTERS:
        return "closed"
    return "open"


def detect_encouragement(text: str) -> bool:
    normalized = _normalize(text)
    return any(phrase in normalized for phrase in _ENCOURAGEMENT_PHRASES)


def detect_checks_understanding(text: str) -> bool:
    normalized = _normalize(text)
    return any(phrase in normalized for phrase in _CHECKS_UNDERSTANDING_PHRASES)


def detect_addresses_mistake(text: str, previous_outcome: Optional[TurnOutcome]) -> Optional[bool]:
    if previous_outcome != TurnOutcome.INCORRECT:
        return None
    normalized = _normalize(text)
    return any(phrase in normalized for phrase in _ADDRESSES_MISTAKE_PHRASES)


def detect_redirects_attention(text: str, previous_outcome: Optional[TurnOutcome]) -> Optional[bool]:
    if previous_outcome != TurnOutcome.DISTRACTED:
        return None
    normalized = _normalize(text)
    return any(phrase in normalized for phrase in _REDIRECTS_ATTENTION_PHRASES)


def detect_follow_up(text: str, previous_child_response: Optional[str]) -> Optional[bool]:
    if not previous_child_response:
        return None

    current_words = {w for w in re.findall(r"[a-z']+", _normalize(text)) if w not in _STOPWORDS}
    previous_words = {w for w in re.findall(r"[a-z']+", _normalize(previous_child_response)) if w not in _STOPWORDS}

    if not current_words or not previous_words:
        return False
    return len(current_words & previous_words) > 0


def word_count(text: str) -> int:
    return len(text.split())