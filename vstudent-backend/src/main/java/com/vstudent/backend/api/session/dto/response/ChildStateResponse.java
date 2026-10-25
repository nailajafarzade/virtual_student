package com.vstudent.backend.api.session.dto.response;

import com.vstudent.backend.persistence.entity.childstate.ChildState;

import java.util.Map;

public record ChildStateResponse(
        Double attention,
        Double engagement,
        Double confidence,
        Double motivation,
        Double curiosity,
        Double frustration,
        Double fatigue,
        String emotionalState,
        Map<Long, Double> topicKnowledge,
        Integer consecutiveCorrect,
        Integer consecutiveIncorrect,
        Integer turnCount
) {
    public static ChildStateResponse from(ChildState state) {
        return new ChildStateResponse(
                state.getAttention(), state.getEngagement(), state.getConfidence(), state.getMotivation(),
                state.getCuriosity(), state.getFrustration(), state.getFatigue(),
                state.getEmotionalState().name(), state.getTopicKnowledge(),
                state.getConsecutiveCorrect(), state.getConsecutiveIncorrect(), state.getTurnCount()
        );
    }
}