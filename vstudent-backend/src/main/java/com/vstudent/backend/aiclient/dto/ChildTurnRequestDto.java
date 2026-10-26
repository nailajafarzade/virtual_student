package com.vstudent.backend.aiclient.dto;

import java.util.List;

public record ChildTurnRequestDto(
        Long sessionId,
        Integer turnSequenceNo,
        String teacherUtterance,
        CurriculumTopicDto curriculumTopic,
        ChildStateDto currentState,
        List<ConversationTurnDto> recentTurns
) {
    public record ConversationTurnDto(String teacherUtterance, String childResponseText) {
    }
}
