package com.vstudent.backend.persistence.repository.session;

import com.vstudent.backend.persistence.entity.session.Turn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TurnRepository extends JpaRepository<Turn, Long> {
    List<Turn> findBySessionIdOrderBySequenceNoAsc(Long sessionId);
    long countBySessionId(Long sessionId);
}