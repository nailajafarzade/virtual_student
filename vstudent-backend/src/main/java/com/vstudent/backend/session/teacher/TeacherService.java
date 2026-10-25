package com.vstudent.backend.session.teacher;

import com.vstudent.backend.persistence.entity.teacher.Teacher;
import com.vstudent.backend.persistence.entity.teacher.TeacherRole;
import com.vstudent.backend.persistence.repository.teacher.TeacherRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;

    public TeacherService(TeacherRepository teacherRepository, PasswordEncoder passwordEncoder) {
        this.teacherRepository = teacherRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Teacher register(String name, String email, String rawPassword) {
        if (teacherRepository.findByEmail(email).isPresent()) {
            throw new IllegalStateException("A teacher with this email is already registered.");
        }
        TeacherRole role = teacherRepository.count() == 0 ? TeacherRole.ADMIN : TeacherRole.TEACHER;
        Teacher teacher = new Teacher(name, email, passwordEncoder.encode(rawPassword), role);
        return teacherRepository.save(teacher);
    }

    public Teacher getCurrentTeacher() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return teacherRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Teacher not found: " + email));
    }

    public void changeOwnPassword(String currentPassword, String newPassword) {
        Teacher teacher = getCurrentTeacher();
        if (!passwordEncoder.matches(currentPassword, teacher.getPasswordHash())) {
            throw new IllegalStateException("Current password is incorrect.");
        }
        teacher.changePasswordHash(passwordEncoder.encode(newPassword));
        teacherRepository.save(teacher);
    }
}