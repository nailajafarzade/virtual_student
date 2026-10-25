package com.vstudent.backend.aiclient.dto;

public record ChildTurnResponseDto(
        String childResponseText,
        String outcome,
        ChildStateDto updatedState,
        Boolean validationPassed
) {
}