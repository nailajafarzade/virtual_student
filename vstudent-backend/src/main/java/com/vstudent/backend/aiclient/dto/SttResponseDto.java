package com.vstudent.backend.aiclient.dto;

public record SttResponseDto(
        String transcribedText,
        Double durationSeconds
) {
}