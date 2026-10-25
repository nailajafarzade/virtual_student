package com.vstudent.backend.evaluation.report;

import com.vstudent.backend.persistence.entity.childstate.ChildState;
import com.vstudent.backend.persistence.entity.session.Session;
import com.vstudent.backend.persistence.entity.evaluation.SessionEvaluationReport;
import com.vstudent.backend.persistence.entity.session.SignalType;
import com.vstudent.backend.persistence.entity.session.TeacherSignal;
import com.vstudent.backend.persistence.entity.session.Turn;
import com.vstudent.backend.persistence.entity.session.TurnOutcome;
import com.vstudent.backend.persistence.repository.childstate.ChildStateRepository;
import com.vstudent.backend.persistence.repository.evaluation.SessionEvaluationReportRepository;
import com.vstudent.backend.persistence.repository.session.TeacherSignalRepository;
import com.vstudent.backend.persistence.repository.session.TurnRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReportGenerationService {

    private final TurnRepository turnRepository;
    private final ChildStateRepository childStateRepository;
    private final TeacherSignalRepository teacherSignalRepository;
    private final SessionEvaluationReportRepository reportRepository;

    public ReportGenerationService(TurnRepository turnRepository,
                                    ChildStateRepository childStateRepository,
                                    TeacherSignalRepository teacherSignalRepository,
                                    SessionEvaluationReportRepository reportRepository) {
        this.turnRepository = turnRepository;
        this.childStateRepository = childStateRepository;
        this.teacherSignalRepository = teacherSignalRepository;
        this.reportRepository = reportRepository;
    }

    public SessionEvaluationReport generateReport(Session session) {
        Long sessionId = session.getId();
        List<Turn> turns = turnRepository.findBySessionIdOrderBySequenceNoAsc(sessionId);
        List<Long> turnIds = turns.stream().map(Turn::getId).toList();

        List<TeacherSignal> allSignals = turnIds.isEmpty()
                ? List.of()
                : teacherSignalRepository.findByTurnIdIn(turnIds);
        Map<Long, List<TeacherSignal>> signalsByTurnId = allSignals.stream()
                .collect(Collectors.groupingBy(TeacherSignal::getTurnId));

        Map<Long, ChildState> stateByTurnId = childStateRepository.findBySessionIdOrderByIdAsc(sessionId).stream()
                .collect(Collectors.toMap(ChildState::getTurnId, cs -> cs));

        Map<String, String> metrics = computeMetrics(session, turns, allSignals, stateByTurnId);
        List<String> highlights = computeHighlights(turns, stateByTurnId, signalsByTurnId);
        String summaryText = SummaryTextGenerator.generate(turns.size(), metrics);

        reportRepository.findBySessionId(sessionId).ifPresent(reportRepository::delete);
        return reportRepository.save(new SessionEvaluationReport(sessionId, metrics, highlights, summaryText));
    }

    public SessionEvaluationReport getReport(Long sessionId) {
        return reportRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new NoSuchElementException(
                        "No report available for session " + sessionId + " — end the session first."));
    }

    public Optional<SessionEvaluationReport> findReport(Long sessionId) {
        return reportRepository.findBySessionId(sessionId);
    }

    private Map<String, String> computeMetrics(Session session, List<Turn> turns, List<TeacherSignal> allSignals,
                                                 Map<Long, ChildState> stateByTurnId) {
        Map<String, String> m = new LinkedHashMap<>();
        int totalTurns = turns.size();
        m.put("total_turns", String.valueOf(totalTurns));

        if (session.getEndedAt() != null) {
            m.put("session_duration_seconds",
                    String.valueOf(Duration.between(session.getStartedAt(), session.getEndedAt()).getSeconds()));
        }

        if (totalTurns == 0) {
            return m;
        }

        Map<TurnOutcome, Long> outcomeCounts = turns.stream()
                .collect(Collectors.groupingBy(Turn::getOutcome, Collectors.counting()));
        m.put("correct_count", String.valueOf(outcomeCounts.getOrDefault(TurnOutcome.CORRECT, 0L)));
        m.put("incorrect_count", String.valueOf(outcomeCounts.getOrDefault(TurnOutcome.INCORRECT, 0L)));
        m.put("needs_clarification_count", String.valueOf(outcomeCounts.getOrDefault(TurnOutcome.NEEDS_CLARIFICATION, 0L)));
        m.put("distracted_count", String.valueOf(outcomeCounts.getOrDefault(TurnOutcome.DISTRACTED, 0L)));

        long questionCount = SignalAggregator.countTrue(allSignals, SignalType.IS_QUESTION);
        m.put("question_count", String.valueOf(questionCount));
        m.put("question_rate", ratio(questionCount, totalTurns));

        long openCount = SignalAggregator.countValueEquals(allSignals, SignalType.QUESTION_TYPE, "open");
        long closedCount = SignalAggregator.countValueEquals(allSignals, SignalType.QUESTION_TYPE, "closed");
        m.put("open_question_count", String.valueOf(openCount));
        m.put("closed_question_count", String.valueOf(closedCount));
        if (openCount + closedCount > 0) {
            m.put("open_question_ratio", ratio(openCount, openCount + closedCount));
        }

        long followUpApplicable = SignalAggregator.countPresent(allSignals, SignalType.IS_FOLLOW_UP);
        if (followUpApplicable > 0) {
            m.put("follow_up_rate", ratio(SignalAggregator.countTrue(allSignals, SignalType.IS_FOLLOW_UP), followUpApplicable));
        }

        long encouragementCount = SignalAggregator.countTrue(allSignals, SignalType.ENCOURAGEMENT_DETECTED);
        m.put("encouragement_count", String.valueOf(encouragementCount));
        m.put("encouragement_rate", ratio(encouragementCount, totalTurns));

        long checksUnderstandingCount = SignalAggregator.countTrue(allSignals, SignalType.CHECKS_UNDERSTANDING);
        m.put("checks_understanding_count", String.valueOf(checksUnderstandingCount));
        m.put("checks_understanding_rate", ratio(checksUnderstandingCount, totalTurns));

        long mistakesApplicable = SignalAggregator.countPresent(allSignals, SignalType.ADDRESSES_MISTAKE);
        if (mistakesApplicable > 0) {
            m.put("mistakes_total", String.valueOf(mistakesApplicable));
            m.put("mistake_handling_rate",
                    ratio(SignalAggregator.countTrue(allSignals, SignalType.ADDRESSES_MISTAKE), mistakesApplicable));
        }

        long redirectsApplicable = SignalAggregator.countPresent(allSignals, SignalType.REDIRECTS_ATTENTION);
        if (redirectsApplicable > 0) {
            m.put("distractions_total", String.valueOf(redirectsApplicable));
            m.put("attention_redirect_rate",
                    ratio(SignalAggregator.countTrue(allSignals, SignalType.REDIRECTS_ATTENTION), redirectsApplicable));
        }

        int totalWordCount = SignalAggregator.sumInt(allSignals, SignalType.WORD_COUNT);
        m.put("total_word_count", String.valueOf(totalWordCount));
        m.put("avg_words_per_turn", String.format("%.1f", totalWordCount / (double) totalTurns));

        double totalSpeechDuration = SignalAggregator.sumDouble(allSignals, SignalType.SPEECH_DURATION_SECONDS);
        if (totalSpeechDuration > 0) {
            m.put("total_speech_duration_seconds", String.format("%.1f", totalSpeechDuration));
        }

        addStateDeltaMetrics(m, turns, stateByTurnId);
        return m;
    }

    private void addStateDeltaMetrics(Map<String, String> m, List<Turn> turns, Map<Long, ChildState> stateByTurnId) {
        ChildState firstState = null;
        ChildState lastState = null;
        for (Turn turn : turns) {
            ChildState state = stateByTurnId.get(turn.getId());
            if (state == null) {
                continue;
            }
            if (firstState == null) {
                firstState = state;
            }
            lastState = state;
        }
        if (firstState == null) {
            return;
        }
        m.put("confidence_start", String.format("%.2f", firstState.getConfidence()));
        m.put("confidence_end", String.format("%.2f", lastState.getConfidence()));
        m.put("frustration_start", String.format("%.2f", firstState.getFrustration()));
        m.put("frustration_end", String.format("%.2f", lastState.getFrustration()));
        m.put("engagement_start", String.format("%.2f", firstState.getEngagement()));
        m.put("engagement_end", String.format("%.2f", lastState.getEngagement()));
    }

    private List<String> computeHighlights(List<Turn> turns, Map<Long, ChildState> stateByTurnId,
                                            Map<Long, List<TeacherSignal>> signalsByTurnId) {
        List<String> highlights = new ArrayList<>();
        ChildState previousState = null;
        for (Turn turn : turns) {
            ChildState currentState = stateByTurnId.get(turn.getId());
            if (currentState == null) {
                continue;
            }
            boolean encouraged = signalsByTurnId.getOrDefault(turn.getId(), List.of()).stream()
                    .anyMatch(s -> s.getSignalType() == SignalType.ENCOURAGEMENT_DETECTED
                            && "true".equalsIgnoreCase(s.getValue()));

            if (encouraged && previousState != null
                    && currentState.getConfidence() > previousState.getConfidence()
                    && highlights.size() < 5) {
                highlights.add("Turn %d: the child's confidence rose after your encouragement."
                        .formatted(turn.getSequenceNo()));
            }
            previousState = currentState;
        }
        return highlights;
    }

    private static String ratio(long numerator, long denominator) {
        return String.format("%.2f", numerator / (double) denominator);
    }
}