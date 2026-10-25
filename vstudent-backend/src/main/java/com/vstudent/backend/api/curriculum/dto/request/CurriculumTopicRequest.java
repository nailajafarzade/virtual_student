package com.vstudent.backend.api.curriculum.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CurriculumTopicRequest(
        @NotBlank String name,
        @NotBlank String objective,
        @NotNull Integer difficultyLevel,
        List<String> exampleQuestions,
        List<String> acceptableAnswers,
        List<String> commonMisconceptions
) {
}