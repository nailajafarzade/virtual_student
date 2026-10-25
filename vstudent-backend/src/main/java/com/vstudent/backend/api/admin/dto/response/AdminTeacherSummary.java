package com.vstudent.backend.api.admin.dto.response;

import java.time.Instant;

public record AdminTeacherSummary(
        Long id,
        String name,
        String email,
        String role,
        long totalSessions,
        long completedSessions,
        Instant lastSessionAt
) {
}