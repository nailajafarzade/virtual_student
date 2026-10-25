package com.vstudent.backend.api.session.dto.response;

import com.vstudent.backend.persistence.entity.session.Session;

import java.time.Instant;

public record SessionResponse(
        Long id,
        Long curriculumTopicId,
        String curriculumTopicName,
        Instant startedAt,
        Instant endedAt,
        String status
) {
    public static SessionResponse from(Session session) {
        return new SessionResponse(
                session.getId(),
                session.getCurriculumTopic().getId(),
                session.getCurriculumTopic().getName(),
                session.getStartedAt(),
                session.getEndedAt(),
                session.getStatus().name()
        );
    }
}