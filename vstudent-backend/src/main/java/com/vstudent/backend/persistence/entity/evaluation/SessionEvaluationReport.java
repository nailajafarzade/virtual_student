package com.vstudent.backend.persistence.entity.evaluation;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "session_evaluation_report")
public class SessionEvaluationReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false, unique = true)
    private Long sessionId;

    @Column(name = "generated_at", nullable = false)
    private Instant generatedAt;

    @ElementCollection
    @CollectionTable(name = "session_report_metrics", joinColumns = @JoinColumn(name = "report_id"))
    @MapKeyColumn(name = "metric_name")
    @Column(name = "metric_value")
    private Map<String, String> metrics = new HashMap<>();

    @ElementCollection
    @CollectionTable(name = "session_report_highlights", joinColumns = @JoinColumn(name = "report_id"))
    @Column(name = "highlight", length = 500)
    private List<String> highlights = new ArrayList<>();

    @Column(name = "summary_text", length = 4000, nullable = false)
    private String summaryText;

    protected SessionEvaluationReport() {
    }

    public SessionEvaluationReport(Long sessionId, Map<String, String> metrics, List<String> highlights, String summaryText) {
        this.sessionId = sessionId;
        this.metrics = new HashMap<>(metrics);
        this.highlights = new ArrayList<>(highlights);
        this.summaryText = summaryText;
        this.generatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getSessionId() { return sessionId; }
    public Instant getGeneratedAt() { return generatedAt; }
    public Map<String, String> getMetrics() { return metrics; }
    public List<String> getHighlights() { return highlights; }
    public String getSummaryText() { return summaryText; }
}