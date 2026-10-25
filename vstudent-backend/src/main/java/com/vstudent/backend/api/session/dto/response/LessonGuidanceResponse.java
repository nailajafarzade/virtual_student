package com.vstudent.backend.api.session.dto.response;

import com.vstudent.backend.lessonengine.LessonEngineService;
import com.vstudent.backend.persistence.entity.curriculum.CurriculumTopic;

public record LessonGuidanceResponse(
        String recommendation,
        Long suggestedTopicId,
        String suggestedTopicName
) {
    public static LessonGuidanceResponse from(LessonEngineService.LessonGuidance guidance) {
        if (guidance == null) {
            return null;
        }
        CurriculumTopic suggested = guidance.suggestedTopic();
        return new LessonGuidanceResponse(
                guidance.recommendation().name(),
                suggested != null ? suggested.getId() : null,
                suggested != null ? suggested.getName() : null
        );
    }
}