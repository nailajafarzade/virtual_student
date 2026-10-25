package com.vstudent.backend.api.session.dto.response;

import com.vstudent.backend.lessonengine.LessonEngineService;
import com.vstudent.backend.persistence.entity.childstate.ChildState;
import com.vstudent.backend.persistence.entity.session.TeacherSignal;
import com.vstudent.backend.persistence.entity.session.Turn;

import java.time.Instant;
import java.util.List;

public record TurnResponse(
        Long id,
        Integer sequenceNo,
        String teacherUtteranceText,
        String childResponseText,
        String audioUrl,
        String outcome,
        Boolean validationPassed,
        Instant timestamp,
        ChildStateResponse childState,
        List<TeacherSignalResponse> teacherSignals,
        LessonGuidanceResponse lessonGuidance
) {
    public static TurnResponse from(Turn turn, ChildState state, List<TeacherSignal> signals,
                                     LessonEngineService.LessonGuidance guidance) {
        String audioUrl = turn.getChildResponseAudioRef() != null
                ? "/api/v1/turns/" + turn.getId() + "/audio"
                : null;
        return new TurnResponse(
                turn.getId(),
                turn.getSequenceNo(),
                turn.getTeacherUtteranceText(),
                turn.getChildResponseText(),
                audioUrl,
                turn.getOutcome().name(),
                turn.getValidationPassed(),
                turn.getTimestamp(),
                state != null ? ChildStateResponse.from(state) : null,
                signals.stream().map(TeacherSignalResponse::from).toList(),
                LessonGuidanceResponse.from(guidance)
        );
    }
}