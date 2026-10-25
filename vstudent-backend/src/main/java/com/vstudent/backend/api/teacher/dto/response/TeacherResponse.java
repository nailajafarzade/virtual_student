package com.vstudent.backend.api.teacher.dto.response;

import com.vstudent.backend.persistence.entity.teacher.Teacher;

public record TeacherResponse(
        Long id,
        String name,
        String email,
        String role
) {
    public static TeacherResponse from(Teacher teacher) {
        return new TeacherResponse(teacher.getId(), teacher.getName(), teacher.getEmail(), teacher.getRole().name());
    }
}