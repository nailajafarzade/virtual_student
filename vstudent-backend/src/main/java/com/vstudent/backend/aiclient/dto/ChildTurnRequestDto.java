package com.vstudent.backend.aiclient.dto;

public record ChildTurnRequestDto(
        Long sessionId,
        Integer turnSequenceNo,
        String teacherUtterance,
        CurriculumTopicDto curriculumTopic,
        ChildStateDto currentState
) {
}