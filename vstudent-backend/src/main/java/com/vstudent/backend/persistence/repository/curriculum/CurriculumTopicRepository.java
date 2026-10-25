package com.vstudent.backend.persistence.repository.curriculum;

import com.vstudent.backend.persistence.entity.curriculum.CurriculumTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CurriculumTopicRepository extends JpaRepository<CurriculumTopic, Long> {
    Optional<CurriculumTopic> findFirstByDifficultyLevelGreaterThanOrderByDifficultyLevelAsc(Integer difficultyLevel);
    Optional<CurriculumTopic> findFirstByDifficultyLevelLessThanOrderByDifficultyLevelDesc(Integer difficultyLevel);
}