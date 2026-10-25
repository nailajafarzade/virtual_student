package com.vstudent.backend.aiclient.dto;

import java.util.List;

public record CurriculumTopicDto(
        Long id,
        String name,
        String objective,
        List<String> exampleQuestions,
        List<String> acceptableAnswers,
        List<String> commonMisconceptions
) {
}