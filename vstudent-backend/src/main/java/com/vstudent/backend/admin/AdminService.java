package com.vstudent.backend.admin;

import com.vstudent.backend.api.admin.dto.response.AdminTeacherSummary;
import com.vstudent.backend.persistence.entity.session.Session;
import com.vstudent.backend.persistence.entity.teacher.Teacher;
import com.vstudent.backend.persistence.entity.teacher.TeacherRole;
import com.vstudent.backend.persistence.repository.teacher.TeacherRepository;
import com.vstudent.backend.session.SessionService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class AdminService {

    private static final String TEMP_PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    private static final int TEMP_PASSWORD_LENGTH = 12;

    private final TeacherRepository teacherRepository;
    private final SessionService sessionService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    public AdminService(TeacherRepository teacherRepository, SessionService sessionService,
                         PasswordEncoder passwordEncoder) {
        this.teacherRepository = teacherRepository;
        this.sessionService = sessionService;
        this.passwordEncoder = passwordEncoder;
    }

    public List<AdminTeacherSummary> listTeachersWithSummary() {
        return teacherRepository.findAll().stream()
                .map(this::toSummary)
                .toList();
    }

    public AdminTeacherSummary changeTeacherRole(Long teacherId, TeacherRole newRole) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new NoSuchElementException("Teacher not found: " + teacherId));

        if (teacher.getRole() == TeacherRole.ADMIN && newRole == TeacherRole.TEACHER) {
            long adminCount = teacherRepository.countByRole(TeacherRole.ADMIN);
            if (adminCount <= 1) {
                throw new IllegalStateException(
                        "Cannot demote " + teacher.getName() + " — they're the only admin left. "
                        + "Promote someone else to admin first.");
            }
        }

        teacher.changeRole(newRole);
        Teacher saved = teacherRepository.save(teacher);
        return toSummary(saved);
    }

    public String resetPassword(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new NoSuchElementException("Teacher not found: " + teacherId));

        String temporaryPassword = generateTemporaryPassword();
        teacher.changePasswordHash(passwordEncoder.encode(temporaryPassword));
        teacherRepository.save(teacher);
        return temporaryPassword;
    }

    private String generateTemporaryPassword() {
        StringBuilder sb = new StringBuilder(TEMP_PASSWORD_LENGTH);
        for (int i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
            sb.append(TEMP_PASSWORD_CHARS.charAt(random.nextInt(TEMP_PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    private AdminTeacherSummary toSummary(Teacher teacher) {
        List<Session> sessions = sessionService.listSessionsForTeacher(teacher.getId());
        long completed = sessions.stream().filter(s -> s.getStatus() == Session.Status.ENDED).count();
        Instant lastActivity = sessions.stream()
                .map(Session::getStartedAt)
                .max(Instant::compareTo)
                .orElse(null);

        return new AdminTeacherSummary(
                teacher.getId(), teacher.getName(), teacher.getEmail(), teacher.getRole().name(),
                sessions.size(), completed, lastActivity
        );
    }
}