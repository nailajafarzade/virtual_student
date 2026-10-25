package com.vstudent.backend.api.session.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SubmitTurnRequest(
        @NotBlank String teacherUtterance
) {
}