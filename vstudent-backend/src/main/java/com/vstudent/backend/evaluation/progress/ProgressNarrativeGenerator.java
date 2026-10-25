package com.vstudent.backend.evaluation.progress;

import com.vstudent.backend.api.progress.dto.response.MetricTrend;

import java.util.ArrayList;
import java.util.List;

public final class ProgressNarrativeGenerator {

    private ProgressNarrativeGenerator() {
    }

    public static String generate(int sessionCount, List<MetricTrend> trends) {
        if (sessionCount == 0) {
            return "Complete a session to start tracking your progress.";
        }
        if (sessionCount == 1) {
            return "You've completed 1 session. Complete another to start seeing trends.";
        }

        List<String> sentences = new ArrayList<>();
        sentences.add("Across " + sessionCount + " sessions:");

        int describedCount = 0;
        for (MetricTrend trend : trends) {
            if ("insufficient_data".equals(trend.direction())) {
                continue;
            }
            String verb = switch (trend.direction()) {
                case "up" -> "improved to";
                case "down" -> "dropped to";
                default -> "held steady around";
            };
            sentences.add(String.format("%s %s %.0f%% (previously averaging %.0f%%).",
                    trend.metricName(), verb, trend.mostRecent() * 100, trend.previousAverage() * 100));
            describedCount++;
        }

        if (describedCount == 0) {
            sentences.add("Not enough repeated data yet on individual metrics to show trends.");
        }

        return String.join(" ", sentences);
    }
}