package com.vstudent.backend.api.admin;

import com.vstudent.backend.admin.AdminService;
import com.vstudent.backend.api.admin.dto.response.AdminTeacherSummary;
import com.vstudent.backend.api.admin.dto.request.ChangeRoleRequest;
import com.vstudent.backend.api.admin.dto.response.PasswordResetResponse;
import com.vstudent.backend.api.progress.dto.response.ProgressResponse;
import com.vstudent.backend.evaluation.progress.ProgressService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;
    private final ProgressService progressService;

    public AdminController(AdminService adminService, ProgressService progressService) {
        this.adminService = adminService;
        this.progressService = progressService;
    }

    @GetMapping("/teachers")
    public List<AdminTeacherSummary> listTeachers() {
        return adminService.listTeachersWithSummary();
    }

    @PutMapping("/teachers/{teacherId}/role")
    public AdminTeacherSummary changeTeacherRole(@PathVariable Long teacherId, @Valid @RequestBody ChangeRoleRequest request) {
        return adminService.changeTeacherRole(teacherId, request.role());
    }

    @PostMapping("/teachers/{teacherId}/reset-password")
    public PasswordResetResponse resetPassword(@PathVariable Long teacherId) {
        return new PasswordResetResponse(adminService.resetPassword(teacherId));
    }

    @GetMapping("/teachers/{teacherId}/progress")
    public ProgressResponse getTeacherProgress(@PathVariable Long teacherId) {
        return progressService.getProgressForTeacher(teacherId);
    }
}