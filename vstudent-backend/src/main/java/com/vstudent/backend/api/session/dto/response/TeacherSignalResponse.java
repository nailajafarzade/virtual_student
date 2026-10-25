package com.vstudent.backend.api.session.dto.response;

import com.vstudent.backend.persistence.entity.session.TeacherSignal;

public record TeacherSignalResponse(
        String signalType,
        String value
) {
    public static TeacherSignalResponse from(TeacherSignal signal) {
        return new TeacherSignalResponse(signal.getSignalType().name(), signal.getValue());
    }
}