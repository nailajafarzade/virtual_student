package com.vstudent.backend.api.session.dto.request;

import jakarta.validation.constraints.NotNull;

public record ChangeTopicRequest(
        @NotNull Long curriculumTopicId
) {
}