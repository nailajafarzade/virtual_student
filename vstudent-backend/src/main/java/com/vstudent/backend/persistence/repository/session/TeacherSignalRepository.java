package com.vstudent.backend.persistence.repository.session;

import com.vstudent.backend.persistence.entity.session.TeacherSignal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherSignalRepository extends JpaRepository<TeacherSignal, Long> {
    List<TeacherSignal> findByTurnId(Long turnId);
    List<TeacherSignal> findByTurnIdIn(List<Long> turnIds);
}