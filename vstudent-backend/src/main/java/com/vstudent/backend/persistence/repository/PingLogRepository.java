package com.vstudent.backend.persistence.repository;

import com.vstudent.backend.persistence.entity.PingLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PingLogRepository extends JpaRepository<PingLog, Long> {
}