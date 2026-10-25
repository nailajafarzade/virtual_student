package com.vstudent.backend.api.admin.dto.response;

public record PasswordResetResponse(
        String temporaryPassword
) {
}