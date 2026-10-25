package com.vstudent.backend.persistence.repository.teacher;

import com.vstudent.backend.persistence.entity.teacher.Teacher;
import com.vstudent.backend.persistence.entity.teacher.TeacherRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByEmail(String email);
    long countByRole(TeacherRole role);
}