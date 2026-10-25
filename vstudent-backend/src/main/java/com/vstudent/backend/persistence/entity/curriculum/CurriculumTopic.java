package com.vstudent.backend.persistence.entity.curriculum;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "curriculum_topic")
public class CurriculumTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, length = 1000)
    private String objective;

    @Column(name = "difficulty_level", nullable = false)
    private Integer difficultyLevel;

    @ElementCollection
    @CollectionTable(name = "curriculum_example_questions", joinColumns = @JoinColumn(name = "topic_id"))
    @Column(name = "question", length = 500)
    private List<String> exampleQuestions = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "curriculum_acceptable_answers", joinColumns = @JoinColumn(name = "topic_id"))
    @Column(name = "answer", length = 200)
    private List<String> acceptableAnswers = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "curriculum_common_misconceptions", joinColumns = @JoinColumn(name = "topic_id"))
    @Column(name = "misconception", length = 500)
    private List<String> commonMisconceptions = new ArrayList<>();

    protected CurriculumTopic() {
    }

    public CurriculumTopic(String name, String objective, Integer difficultyLevel) {
        this.name = name;
        this.objective = objective;
        this.difficultyLevel = difficultyLevel;
    }

    public void update(String name, String objective, Integer difficultyLevel,
                       List<String> exampleQuestions, List<String> acceptableAnswers,
                       List<String> commonMisconceptions) {
        this.name = name;
        this.objective = objective;
        this.difficultyLevel = difficultyLevel;
        this.exampleQuestions.clear();
        this.exampleQuestions.addAll(exampleQuestions);
        this.acceptableAnswers.clear();
        this.acceptableAnswers.addAll(acceptableAnswers);
        this.commonMisconceptions.clear();
        this.commonMisconceptions.addAll(commonMisconceptions);
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getObjective() { return objective; }
    public Integer getDifficultyLevel() { return difficultyLevel; }
    public List<String> getExampleQuestions() { return exampleQuestions; }
    public List<String> getAcceptableAnswers() { return acceptableAnswers; }
    public List<String> getCommonMisconceptions() { return commonMisconceptions; }
}