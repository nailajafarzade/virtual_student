package com.vstudent.backend.api.progress.dto.response;

import java.util.List;

public record ProgressResponse(
        List<SessionProgressPoint> sessions,
        List<MetricTrend> trends,
        String narrativeText
) {
}