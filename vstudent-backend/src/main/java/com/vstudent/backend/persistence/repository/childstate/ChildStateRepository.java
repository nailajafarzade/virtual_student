package com.vstudent.backend.persistence.repository.childstate;

import com.vstudent.backend.persistence.entity.childstate.ChildState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChildStateRepository extends JpaRepository<ChildState, Long> {
    Optional<ChildState> findTopBySessionIdOrderByIdDesc(Long sessionId);
    Optional<ChildState> findByTurnId(Long turnId);
    List<ChildState> findBySessionIdOrderByIdAsc(Long sessionId);
}