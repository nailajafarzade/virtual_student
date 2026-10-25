package com.vstudent.backend.childstate;

import com.vstudent.backend.aiclient.dto.ChildStateDto;
import com.vstudent.backend.persistence.entity.childstate.ChildState;
import com.vstudent.backend.persistence.entity.childstate.EmotionalState;

public final class ChildStateMapper {

    private ChildStateMapper() {
    }

    public static ChildStateDto toDto(ChildState entity) {
        return new ChildStateDto(
                entity.getAttention(),
                entity.getEngagement(),
                entity.getConfidence(),
                entity.getMotivation(),
                entity.getCuriosity(),
                entity.getFrustration(),
                entity.getFatigue(),
                entity.getEmotionalState().name().toLowerCase(),
                entity.getTopicKnowledge(),
                entity.getConsecutiveCorrect(),
                entity.getConsecutiveIncorrect(),
                entity.getTurnCount()
        );
    }

    public static ChildState toEntity(ChildStateDto dto, Long sessionId, Long turnId) {
        return new ChildState(
                sessionId, turnId,
                dto.attention(), dto.engagement(), dto.confidence(), dto.motivation(),
                dto.curiosity(), dto.frustration(), dto.fatigue(),
                EmotionalState.valueOf(dto.emotionalState().toUpperCase()),
                dto.topicKnowledge(),
                dto.consecutiveCorrect(), dto.consecutiveIncorrect(), dto.turnCount()
        );
    }
}