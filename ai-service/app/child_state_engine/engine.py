import random

from app.child_state_engine.models import ChildState, EmotionalState, TurnOutcome

DISTRACTION_ATTENTION_WEIGHT = 0.4
DISTRACTION_FATIGUE_WEIGHT = 0.25
DISTRACTION_MAX_PROBABILITY = 0.55

CLARIFICATION_BASE_PROBABILITY = 0.08
CLARIFICATION_LOW_CONFIDENCE_THRESHOLD = 0.4
CLARIFICATION_LOW_CONFIDENCE_BONUS = 0.12

PERFORMANCE_ATTENTION_WEIGHT = 0.20
PERFORMANCE_ENGAGEMENT_WEIGHT = 0.15
PERFORMANCE_FRUSTRATION_WEIGHT = 0.25
PERFORMANCE_FATIGUE_WEIGHT = 0.15
RANDOM_NOISE_RANGE = 0.05
MIN_PROBABILITY_CORRECT = 0.02
MAX_PROBABILITY_CORRECT = 0.98

KNOWLEDGE_LEARNING_RATE = 0.15
FATIGUE_INCREMENT_PER_TURN = 0.03
ATTENTION_RECOVERY_ON_CORRECT = 0.04
ATTENTION_DECAY_ON_DISTRACTED = 0.10
ENGAGEMENT_DECAY_ON_DISTRACTED = 0.05
CONFIDENCE_GAIN_ON_CORRECT = 0.08
CONFIDENCE_LOSS_ON_INCORRECT = 0.06
FRUSTRATION_GAIN_ON_INCORRECT = 0.10
FRUSTRATION_DECAY_ON_CORRECT = 0.07
MOTIVATION_GAIN_ON_CORRECT = 0.05
MOTIVATION_LOSS_ON_STREAK_INCORRECT = 0.08
STREAK_THRESHOLD_FOR_MOTIVATION_LOSS = 2
CURIOSITY_GAIN_ON_CLARIFICATION = 0.03

EMOTION_FATIGUE_THRESHOLD = 0.70
EMOTION_FRUSTRATION_THRESHOLD = 0.65
EMOTION_SHY_CONFIDENCE_THRESHOLD = 0.35
EMOTION_SHY_ATTENTION_THRESHOLD = 0.50
EMOTION_CURIOUS_THRESHOLD = 0.65
EMOTION_CURIOUS_ENGAGEMENT_THRESHOLD = 0.50
EMOTION_CONFIDENT_THRESHOLD = 0.70


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def decide_turn_outcome(state: ChildState, topic_id: int) -> TurnOutcome:
    p_distracted = min(
        DISTRACTION_MAX_PROBABILITY,
        DISTRACTION_ATTENTION_WEIGHT * (1 - state.attention)
        + DISTRACTION_FATIGUE_WEIGHT * state.fatigue,
    )
    if random.random() < p_distracted:
        return TurnOutcome.DISTRACTED

    p_clarification = CLARIFICATION_BASE_PROBABILITY
    if state.confidence < CLARIFICATION_LOW_CONFIDENCE_THRESHOLD:
        p_clarification += CLARIFICATION_LOW_CONFIDENCE_BONUS
    if random.random() < p_clarification:
        return TurnOutcome.NEEDS_CLARIFICATION

    knowledge = state.knowledge_for(topic_id)
    performance_adjustment = (
        PERFORMANCE_ATTENTION_WEIGHT * (state.attention - 0.5)
        + PERFORMANCE_ENGAGEMENT_WEIGHT * (state.engagement - 0.5)
        - PERFORMANCE_FRUSTRATION_WEIGHT * state.frustration
        - PERFORMANCE_FATIGUE_WEIGHT * state.fatigue
    )
    noise = random.uniform(-RANDOM_NOISE_RANGE, RANDOM_NOISE_RANGE)
    p_correct = _clamp(
        knowledge + performance_adjustment + noise,
        MIN_PROBABILITY_CORRECT,
        MAX_PROBABILITY_CORRECT,
    )
    return TurnOutcome.CORRECT if random.random() < p_correct else TurnOutcome.INCORRECT


def apply_outcome(state: ChildState, topic_id: int, outcome: TurnOutcome) -> ChildState:
    """Təmiz funksiya: state + outcome -> yeni state. Giriş dəyişdirilmir."""
    new_state = state.model_copy(deep=True)
    new_state.turn_count += 1
    new_state.fatigue = _clamp(state.fatigue + FATIGUE_INCREMENT_PER_TURN)

    if outcome == TurnOutcome.CORRECT:
        new_state.consecutive_correct = state.consecutive_correct + 1
        new_state.consecutive_incorrect = 0
        new_state.confidence = _clamp(state.confidence + CONFIDENCE_GAIN_ON_CORRECT)
        new_state.frustration = _clamp(state.frustration - FRUSTRATION_DECAY_ON_CORRECT)
        new_state.motivation = _clamp(state.motivation + MOTIVATION_GAIN_ON_CORRECT)
        new_state.attention = _clamp(state.attention + ATTENTION_RECOVERY_ON_CORRECT)
        prior_knowledge = state.knowledge_for(topic_id)
        new_state.topic_knowledge[topic_id] = _clamp(
            prior_knowledge + KNOWLEDGE_LEARNING_RATE * (1.0 - prior_knowledge)
        )

    elif outcome == TurnOutcome.INCORRECT:
        new_state.consecutive_incorrect = state.consecutive_incorrect + 1
        new_state.consecutive_correct = 0
        new_state.confidence = _clamp(state.confidence - CONFIDENCE_LOSS_ON_INCORRECT)
        new_state.frustration = _clamp(state.frustration + FRUSTRATION_GAIN_ON_INCORRECT)
        if new_state.consecutive_incorrect >= STREAK_THRESHOLD_FOR_MOTIVATION_LOSS:
            new_state.motivation = _clamp(state.motivation - MOTIVATION_LOSS_ON_STREAK_INCORRECT)
        prior_knowledge = state.knowledge_for(topic_id)
        new_state.topic_knowledge[topic_id] = _clamp(
            prior_knowledge + KNOWLEDGE_LEARNING_RATE * (0.0 - prior_knowledge)
        )

    elif outcome == TurnOutcome.DISTRACTED:
        new_state.attention = _clamp(state.attention - ATTENTION_DECAY_ON_DISTRACTED)
        new_state.engagement = _clamp(state.engagement - ENGAGEMENT_DECAY_ON_DISTRACTED)

    elif outcome == TurnOutcome.NEEDS_CLARIFICATION:
        new_state.curiosity = _clamp(state.curiosity + CURIOSITY_GAIN_ON_CLARIFICATION)

    new_state.emotional_state = _derive_emotional_state(new_state)
    return new_state


def _derive_emotional_state(state: ChildState) -> EmotionalState:
    if state.fatigue > EMOTION_FATIGUE_THRESHOLD:
        return EmotionalState.TIRED
    if state.frustration > EMOTION_FRUSTRATION_THRESHOLD:
        return EmotionalState.FRUSTRATED
    if (state.confidence < EMOTION_SHY_CONFIDENCE_THRESHOLD
            and state.attention < EMOTION_SHY_ATTENTION_THRESHOLD):
        return EmotionalState.SHY
    if (state.curiosity > EMOTION_CURIOUS_THRESHOLD
            and state.engagement > EMOTION_CURIOUS_ENGAGEMENT_THRESHOLD):
        return EmotionalState.CURIOUS
    if state.confidence > EMOTION_CONFIDENT_THRESHOLD:
        return EmotionalState.CONFIDENT
    return EmotionalState.NEUTRAL