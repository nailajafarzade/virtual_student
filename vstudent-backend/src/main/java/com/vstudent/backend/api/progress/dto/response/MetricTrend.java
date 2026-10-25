package com.vstudent.backend.api.progress.dto.response;

public record MetricTrend(
        String metricName,
        Double mostRecent,
        Double previousAverage,
        String direction
) {
}