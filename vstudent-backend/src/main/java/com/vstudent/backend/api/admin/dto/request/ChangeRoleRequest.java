package com.vstudent.backend.api.admin.dto.request;

import com.vstudent.backend.persistence.entity.teacher.TeacherRole;
import jakarta.validation.constraints.NotNull;

public record ChangeRoleRequest(
        @NotNull TeacherRole role
) {
}