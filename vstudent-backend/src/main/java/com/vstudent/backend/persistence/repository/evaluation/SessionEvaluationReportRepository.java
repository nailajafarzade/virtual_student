package com.vstudent.backend.persistence.repository.evaluation;

import com.vstudent.backend.persistence.entity.evaluation.SessionEvaluationReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SessionEvaluationReportRepository extends JpaRepository<SessionEvaluationReport, Long> {
    Optional<SessionEvaluationReport> findBySessionId(Long sessionId);
}