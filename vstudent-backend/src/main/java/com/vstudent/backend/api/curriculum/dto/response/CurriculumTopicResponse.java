package com.vstudent.backend.api.curriculum.dto.response;

import com.vstudent.backend.persistence.entity.curriculum.CurriculumTopic;

import java.util.List;

public record CurriculumTopicResponse(
        Long id,
        String name,
        String objective,
        Integer difficultyLevel,
        List<String> exampleQuestions,
        List<String> acceptableAnswers,
        List<String> commonMisconceptions
) {
    public static CurriculumTopicResponse from(CurriculumTopic topic) {
        return new CurriculumTopicResponse(
                topic.getId(),
                topic.getName(),
                topic.getObjective(),
                topic.getDifficultyLevel(),
                List.copyOf(topic.getExampleQuestions()),
                List.copyOf(topic.getAcceptableAnswers()),
                List.copyOf(topic.getCommonMisconceptions())
        );
    }
}