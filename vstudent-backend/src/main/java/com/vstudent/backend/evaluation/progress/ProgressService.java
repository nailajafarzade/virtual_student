package com.vstudent.backend.evaluation.progress;

import com.vstudent.backend.evaluation.report.ReportGenerationService;

import com.vstudent.backend.api.progress.dto.response.MetricTrend;
import com.vstudent.backend.api.progress.dto.response.ProgressResponse;
import com.vstudent.backend.api.progress.dto.response.SessionProgressPoint;
import com.vstudent.backend.persistence.entity.session.Session;
import com.vstudent.backend.session.SessionService;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class ProgressService {

    private final SessionService sessionService;
    private final ReportGenerationService reportGenerationService;

    public ProgressService(SessionService sessionService, ReportGenerationService reportGenerationService) {
        this.sessionService = sessionService;
        this.reportGenerationService = reportGenerationService;
    }

    public ProgressResponse getProgressForCurrentTeacher() {
        return buildProgress(sessionService.listSessionsForCurrentTeacher());
    }

    public ProgressResponse getProgressForTeacher(Long teacherId) {
        return buildProgress(sessionService.listSessionsForTeacher(teacherId));
    }

    private ProgressResponse buildProgress(List<Session> sessions) {
        List<SessionProgressPoint> points = sessions.stream()
                .filter(s -> s.getStatus() == Session.Status.ENDED)
                .sorted(Comparator.comparing(Session::getStartedAt))
                .map(this::toProgressPoint)
                .filter(Objects::nonNull)
                .toList();

        List<MetricTrend> trends = ProgressTrendCalculator.computeTrends(points);
        String narrative = ProgressNarrativeGenerator.generate(points.size(), trends);

        return new ProgressResponse(points, trends, narrative);
    }

    private SessionProgressPoint toProgressPoint(Session session) {
        return reportGenerationService.findReport(session.getId())
                .map(report -> {
                    Map<String, String> m = report.getMetrics();
                    return new SessionProgressPoint(
                            session.getId(),
                            session.getStartedAt(),
                            session.getCurriculumTopic().getName(),
                            parseIntOrZero(m, "total_turns"),
                            parseDoubleOrNull(m, "encouragement_rate"),
                            parseDoubleOrNull(m, "checks_understanding_rate"),
                            parseDoubleOrNull(m, "open_question_ratio"),
                            parseDoubleOrNull(m, "mistake_handling_rate"),
                            parseDoubleOrNull(m, "confidence_end")
                    );
                })
                .orElse(null);
    }

    private static int parseIntOrZero(Map<String, String> metrics, String key) {
        String value = metrics.get(key);
        return value != null ? Integer.parseInt(value) : 0;
    }

    private static Double parseDoubleOrNull(Map<String, String> metrics, String key) {
        String value = metrics.get(key);
        return value != null ? Double.parseDouble(value) : null;
    }
}