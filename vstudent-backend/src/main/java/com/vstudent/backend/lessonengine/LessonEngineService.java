package com.vstudent.backend.lessonengine;

import com.vstudent.backend.persistence.entity.childstate.ChildState;
import com.vstudent.backend.persistence.entity.curriculum.CurriculumTopic;
import com.vstudent.backend.persistence.repository.curriculum.CurriculumTopicRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LessonEngineService {

    private final CurriculumTopicRepository curriculumTopicRepository;

    public LessonEngineService(CurriculumTopicRepository curriculumTopicRepository) {
        this.curriculumTopicRepository = curriculumTopicRepository;
    }

    public record LessonGuidance(LessonRecommendation recommendation, CurriculumTopic suggestedTopic) {
    }

    public LessonGuidance getGuidance(CurriculumTopic currentTopic, ChildState state) {
        LessonRecommendation recommendation = LessonEngine.recommend(state);

        Optional<CurriculumTopic> suggestedTopic = switch (recommendation) {
            case READY_TO_ADVANCE -> curriculumTopicRepository
                    .findFirstByDifficultyLevelGreaterThanOrderByDifficultyLevelAsc(currentTopic.getDifficultyLevel());
            case CONSIDER_EASIER_TOPIC -> curriculumTopicRepository
                    .findFirstByDifficultyLevelLessThanOrderByDifficultyLevelDesc(currentTopic.getDifficultyLevel());
            case CONTINUE -> Optional.empty();
        };

        return new LessonGuidance(recommendation, suggestedTopic.orElse(null));
    }
}