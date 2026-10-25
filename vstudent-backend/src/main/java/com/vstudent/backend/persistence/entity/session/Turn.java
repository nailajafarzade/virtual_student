package com.vstudent.backend.persistence.entity.session;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "turn")
public class Turn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @Column(name = "sequence_no", nullable = false)
    private Integer sequenceNo;

    @Column(name = "teacher_utterance_text", nullable = false, length = 2000)
    private String teacherUtteranceText;

    @Column(name = "child_response_text", nullable = false, length = 2000)
    private String childResponseText;

    @Column(name = "child_response_audio_ref")
    private String childResponseAudioRef;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TurnOutcome outcome;

    @Column(name = "validation_passed", nullable = false)
    private Boolean validationPassed;

    @Column(nullable = false)
    private Instant timestamp;

    protected Turn() {
    }

    public Turn(Session session, Integer sequenceNo, String teacherUtteranceText,
                String childResponseText, String childResponseAudioRef,
                TurnOutcome outcome, Boolean validationPassed) {
        this.session = session;
        this.sequenceNo = sequenceNo;
        this.teacherUtteranceText = teacherUtteranceText;
        this.childResponseText = childResponseText;
        this.childResponseAudioRef = childResponseAudioRef;
        this.outcome = outcome;
        this.validationPassed = validationPassed;
        this.timestamp = Instant.now();
    }

    public Long getId() { return id; }
    public Session getSession() { return session; }
    public Integer getSequenceNo() { return sequenceNo; }
    public String getTeacherUtteranceText() { return teacherUtteranceText; }
    public String getChildResponseText() { return childResponseText; }
    public String getChildResponseAudioRef() { return childResponseAudioRef; }
    public TurnOutcome getOutcome() { return outcome; }
    public Boolean getValidationPassed() { return validationPassed; }
    public Instant getTimestamp() { return timestamp; }
}