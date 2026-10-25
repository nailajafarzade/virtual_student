package com.vstudent.backend.api.progress.dto.response;

import java.time.Instant;

public record SessionProgressPoint(
        Long sessionId,
        Instant startedAt,
        String curriculumTopicName,
        int totalTurns,
        Double encouragementRate,
        Double checksUnderstandingRate,
        Double openQuestionRatio,
        Double mistakeHandlingRate,
        Double confidenceEnd
) {
}