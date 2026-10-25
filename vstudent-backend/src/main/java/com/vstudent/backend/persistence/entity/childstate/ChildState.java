package com.vstudent.backend.persistence.entity.childstate;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "child_state")
public class ChildState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @Column(name = "turn_id", nullable = false, unique = true)
    private Long turnId;

    @Column(nullable = false) private Double attention;
    @Column(nullable = false) private Double engagement;
    @Column(nullable = false) private Double confidence;
    @Column(nullable = false) private Double motivation;
    @Column(nullable = false) private Double curiosity;
    @Column(nullable = false) private Double frustration;
    @Column(nullable = false) private Double fatigue;

    @Enumerated(EnumType.STRING)
    @Column(name = "emotional_state", nullable = false)
    private EmotionalState emotionalState;

    @ElementCollection
    @CollectionTable(name = "child_state_topic_knowledge", joinColumns = @JoinColumn(name = "child_state_id"))
    @MapKeyColumn(name = "topic_id")
    @Column(name = "proficiency")
    private Map<Long, Double> topicKnowledge = new HashMap<>();

    @Column(name = "consecutive_correct", nullable = false)
    private Integer consecutiveCorrect;

    @Column(name = "consecutive_incorrect", nullable = false)
    private Integer consecutiveIncorrect;

    @Column(name = "turn_count", nullable = false)
    private Integer turnCount;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected ChildState() {
    }

    public ChildState(Long sessionId, Long turnId, Double attention, Double engagement, Double confidence,
                       Double motivation, Double curiosity, Double frustration, Double fatigue,
                       EmotionalState emotionalState, Map<Long, Double> topicKnowledge,
                       Integer consecutiveCorrect, Integer consecutiveIncorrect, Integer turnCount) {
        this.sessionId = sessionId;
        this.turnId = turnId;
        this.attention = attention;
        this.engagement = engagement;
        this.confidence = confidence;
        this.motivation = motivation;
        this.curiosity = curiosity;
        this.frustration = frustration;
        this.fatigue = fatigue;
        this.emotionalState = emotionalState;
        this.topicKnowledge = topicKnowledge != null ? new HashMap<>(topicKnowledge) : new HashMap<>();
        this.consecutiveCorrect = consecutiveCorrect;
        this.consecutiveIncorrect = consecutiveIncorrect;
        this.turnCount = turnCount;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getSessionId() { return sessionId; }
    public Long getTurnId() { return turnId; }
    public Double getAttention() { return attention; }
    public Double getEngagement() { return engagement; }
    public Double getConfidence() { return confidence; }
    public Double getMotivation() { return motivation; }
    public Double getCuriosity() { return curiosity; }
    public Double getFrustration() { return frustration; }
    public Double getFatigue() { return fatigue; }
    public EmotionalState getEmotionalState() { return emotionalState; }
    public Map<Long, Double> getTopicKnowledge() { return topicKnowledge; }
    public Integer getConsecutiveCorrect() { return consecutiveCorrect; }
    public Integer getConsecutiveIncorrect() { return consecutiveIncorrect; }
    public Integer getTurnCount() { return turnCount; }
    public Instant getCreatedAt() { return createdAt; }
}