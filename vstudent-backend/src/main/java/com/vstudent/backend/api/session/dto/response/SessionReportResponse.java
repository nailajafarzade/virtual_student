package com.vstudent.backend.api.session.dto.response;

import com.vstudent.backend.persistence.entity.evaluation.SessionEvaluationReport;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record SessionReportResponse(
        Long sessionId,
        Instant generatedAt,
        Map<String, String> metrics,
        List<String> highlights,
        String summaryText
) {
    public static SessionReportResponse from(SessionEvaluationReport report) {
        return new SessionReportResponse(
                report.getSessionId(),
                report.getGeneratedAt(),
                report.getMetrics(),
                report.getHighlights(),
                report.getSummaryText()
        );
    }
}