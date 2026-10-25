package com.vstudent.backend.api.session.dto.response;

import com.vstudent.backend.persistence.entity.session.Session;

import java.time.Instant;

public record SessionSummaryResponse(
        Long id,
        String curriculumTopicName,
        Instant startedAt,
        Instant endedAt,
        String status,
        long turnCount
) {
    public static SessionSummaryResponse from(Session session, long turnCount) {
        return new SessionSummaryResponse(
                session.getId(),
                session.getCurriculumTopic().getName(),
                session.getStartedAt(),
                session.getEndedAt(),
                session.getStatus().name(),
                turnCount
        );
    }
}