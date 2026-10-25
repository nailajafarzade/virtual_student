package com.vstudent.backend.api.teacher;

import com.vstudent.backend.api.teacher.dto.request.ChangePasswordRequest;
import com.vstudent.backend.api.teacher.dto.request.RegisterTeacherRequest;
import com.vstudent.backend.api.teacher.dto.response.TeacherResponse;
import com.vstudent.backend.session.teacher.TeacherService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/teachers")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public TeacherResponse register(@Valid @RequestBody RegisterTeacherRequest request) {
        return TeacherResponse.from(teacherService.register(request.name(), request.email(), request.password()));
    }

    // Frontend login bu endpoint ilə Basic Auth məlumatlarını yoxlayır.
    @GetMapping("/me")
    public TeacherResponse getCurrentTeacher() {
        return TeacherResponse.from(teacherService.getCurrentTeacher());
    }

    @PostMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changeOwnPassword(@Valid @RequestBody ChangePasswordRequest request) {
        teacherService.changeOwnPassword(request.currentPassword(), request.newPassword());
    }
}
