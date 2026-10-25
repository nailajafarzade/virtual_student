package com.vstudent.backend.persistence.repository.session;

import com.vstudent.backend.persistence.entity.session.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByTeacherIdOrderByStartedAtDesc(Long teacherId);
}