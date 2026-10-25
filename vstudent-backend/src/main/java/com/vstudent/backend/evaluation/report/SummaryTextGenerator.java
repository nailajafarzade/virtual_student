package com.vstudent.backend.evaluation.report;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class SummaryTextGenerator {

    private SummaryTextGenerator() {
    }

    public static String generate(int totalTurns, Map<String, String> metrics) {
        if (totalTurns == 0) {
            return "No turns were recorded in this session.";
        }

        List<String> sentences = new ArrayList<>();
        sentences.add(turnCountSentence(totalTurns, metrics));
        sentences.add(outcomeSentence(metrics));
        questionSentence(metrics).ifPresent(sentences::add);
        supportSentence(metrics).ifPresent(sentences::add);
        mistakeHandlingSentence(metrics).ifPresent(sentences::add);
        attentionSentence(metrics).ifPresent(sentences::add);
        confidenceTrendSentence(metrics).ifPresent(sentences::add);

        return String.join(" ", sentences);
    }

    private static String turnCountSentence(int totalTurns, Map<String, String> metrics) {
        StringBuilder sb = new StringBuilder("This session included %s teacher turn%s"
                .formatted(metrics.get("total_turns"), plural(String.valueOf(totalTurns))));
        if (metrics.containsKey("session_duration_seconds")) {
            long minutes = Long.parseLong(metrics.get("session_duration_seconds")) / 60;
            sb.append(" over %d minute%s".formatted(minutes, plural(String.valueOf(minutes))));
        }
        return sb.append(".").toString();
    }

    private static String outcomeSentence(Map<String, String> metrics) {
        return "The child answered correctly %s time%s, incorrectly %s time%s, needed clarification %s time%s, and was distracted %s time%s."
                .formatted(
                        metrics.get("correct_count"), plural(metrics.get("correct_count")),
                        metrics.get("incorrect_count"), plural(metrics.get("incorrect_count")),
                        metrics.get("needs_clarification_count"), plural(metrics.get("needs_clarification_count")),
                        metrics.get("distracted_count"), plural(metrics.get("distracted_count"))
                );
    }

    private static Optional<String> questionSentence(Map<String, String> metrics) {
        if (!metrics.containsKey("question_count")) {
            return Optional.empty();
        }
        StringBuilder sb = new StringBuilder("You asked %s question%s"
                .formatted(metrics.get("question_count"), plural(metrics.get("question_count"))));
        if (metrics.containsKey("open_question_ratio")) {
            sb.append(", %.0f%% open-ended".formatted(asPercent(metrics.get("open_question_ratio"))));
        }
        return Optional.of(sb.append(".").toString());
    }

    private static Optional<String> supportSentence(Map<String, String> metrics) {
        boolean hasEncouragement = metrics.containsKey("encouragement_rate");
        boolean hasChecks = metrics.containsKey("checks_understanding_rate");
        if (!hasEncouragement && !hasChecks) {
            return Optional.empty();
        }
        StringBuilder sb = new StringBuilder();
        if (hasEncouragement) {
            sb.append("You gave encouragement in %.0f%% of turns".formatted(asPercent(metrics.get("encouragement_rate"))));
        }
        if (hasChecks) {
            sb.append(hasEncouragement ? " and checked" : "You checked");
            sb.append(" understanding %.0f%% of the time".formatted(asPercent(metrics.get("checks_understanding_rate"))));
        }
        return Optional.of(sb.append(".").toString());
    }

    private static Optional<String> mistakeHandlingSentence(Map<String, String> metrics) {
        if (!metrics.containsKey("mistake_handling_rate")) {
            return Optional.empty();
        }
        return Optional.of("When the child made a mistake, you addressed it %.0f%% of the time."
                .formatted(asPercent(metrics.get("mistake_handling_rate"))));
    }

    private static Optional<String> attentionSentence(Map<String, String> metrics) {
        if (!metrics.containsKey("attention_redirect_rate")) {
            return Optional.empty();
        }
        return Optional.of("When the child got distracted, you redirected their attention %.0f%% of the time."
                .formatted(asPercent(metrics.get("attention_redirect_rate"))));
    }

    private static Optional<String> confidenceTrendSentence(Map<String, String> metrics) {
        if (!metrics.containsKey("confidence_start") || !metrics.containsKey("confidence_end")) {
            return Optional.empty();
        }
        String start = metrics.get("confidence_start");
        String end = metrics.get("confidence_end");
        return Optional.of("The child's confidence %s from %s to %s over the session."
                .formatted(trendWord(start, end), start, end));
    }

    private static String plural(String countStr) {
        return "1".equals(countStr) ? "" : "s";
    }

    private static double asPercent(String rateStr) {
        return Double.parseDouble(rateStr) * 100;
    }

    private static String trendWord(String startStr, String endStr) {
        double start = Double.parseDouble(startStr);
        double end = Double.parseDouble(endStr);
        if (end > start) return "rose";
        if (end < start) return "fell";
        return "stayed steady";
    }
}