package com.vstudent.backend.evaluation.progress;

import com.vstudent.backend.api.progress.dto.response.MetricTrend;
import com.vstudent.backend.api.progress.dto.response.SessionProgressPoint;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;

public final class ProgressTrendCalculator {

    private static final double FLAT_THRESHOLD = 0.05;

    private ProgressTrendCalculator() {
    }

    public static List<MetricTrend> computeTrends(List<SessionProgressPoint> points) {
        List<MetricTrend> trends = new ArrayList<>();
        trends.add(computeTrend("Encouragement rate", points, SessionProgressPoint::encouragementRate));
        trends.add(computeTrend("Checks understanding rate", points, SessionProgressPoint::checksUnderstandingRate));
        trends.add(computeTrend("Open question ratio", points, SessionProgressPoint::openQuestionRatio));
        trends.add(computeTrend("Mistake handling rate", points, SessionProgressPoint::mistakeHandlingRate));
        return trends;
    }

    private static MetricTrend computeTrend(String name, List<SessionProgressPoint> points,
                                             Function<SessionProgressPoint, Double> extractor) {
        if (points.isEmpty()) {
            return new MetricTrend(name, null, null, "insufficient_data");
        }

        Double mostRecent = extractor.apply(points.get(points.size() - 1));
        List<Double> previousValues = points.subList(0, points.size() - 1).stream()
                .map(extractor)
                .filter(Objects::nonNull)
                .toList();

        if (mostRecent == null || previousValues.isEmpty()) {
            return new MetricTrend(name, mostRecent, null, "insufficient_data");
        }

        double previousAverage = previousValues.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double roundedAverage = Math.round(previousAverage * 100.0) / 100.0;
        double delta = mostRecent - previousAverage;

        String direction;
        if (Math.abs(delta) < FLAT_THRESHOLD) {
            direction = "flat";
        } else if (delta > 0) {
            direction = "up";
        } else {
            direction = "down";
        }

        return new MetricTrend(name, mostRecent, roundedAverage, direction);
    }
}