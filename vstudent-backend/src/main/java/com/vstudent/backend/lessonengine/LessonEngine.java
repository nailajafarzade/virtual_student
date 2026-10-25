package com.vstudent.backend.lessonengine;

import com.vstudent.backend.persistence.entity.childstate.ChildState;

public final class LessonEngine {

    static final int ADVANCE_STREAK_THRESHOLD = 2;
    static final int EASIER_STREAK_THRESHOLD = 3;
    static final double FRUSTRATION_THRESHOLD = 0.6;

    private LessonEngine() {
    }

    public static LessonRecommendation recommend(ChildState state) {
        if (state == null) {
            return LessonRecommendation.CONTINUE;
        }
        if (state.getFrustration() > FRUSTRATION_THRESHOLD || state.getConsecutiveIncorrect() >= EASIER_STREAK_THRESHOLD) {
            return LessonRecommendation.CONSIDER_EASIER_TOPIC;
        }
        if (state.getConsecutiveCorrect() >= ADVANCE_STREAK_THRESHOLD) {
            return LessonRecommendation.READY_TO_ADVANCE;
        }
        return LessonRecommendation.CONTINUE;
    }
}