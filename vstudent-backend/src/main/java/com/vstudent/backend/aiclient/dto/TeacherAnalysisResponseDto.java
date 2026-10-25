package com.vstudent.backend.aiclient.dto;

import java.util.List;

public record TeacherAnalysisResponseDto(
        List<TeacherSignalDto> signals
) {
}