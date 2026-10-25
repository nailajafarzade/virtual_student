package com.vstudent.backend.aiclient.dto;

public record TeacherAnalysisRequestDto(
        String teacherUtterance,
        String previousOutcome,
        String previousChildResponse,
        Double speechDurationSeconds
) {
}