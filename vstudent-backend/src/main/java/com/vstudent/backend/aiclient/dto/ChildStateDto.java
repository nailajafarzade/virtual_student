package com.vstudent.backend.aiclient.dto;

import java.util.Map;

public record ChildStateDto(
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
}