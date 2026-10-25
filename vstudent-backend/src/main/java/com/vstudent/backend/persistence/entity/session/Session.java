package com.vstudent.backend.persistence.entity.session;

import com.vstudent.backend.persistence.entity.curriculum.CurriculumTopic;
import com.vstudent.backend.persistence.entity.teacher.Teacher;

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
@Table(name = "session")
public class Session {

    public enum Status { ACTIVE, ENDED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne
    @JoinColumn(name = "curriculum_topic_id", nullable = false)
    private CurriculumTopic curriculumTopic;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    protected Session() {
    }

    public Session(Teacher teacher, CurriculumTopic curriculumTopic) {
        this.teacher = teacher;
        this.curriculumTopic = curriculumTopic;
        this.startedAt = Instant.now();
        this.status = Status.ACTIVE;
    }

    public void end() {
        if (this.status != Status.ENDED) {
            this.status = Status.ENDED;
            this.endedAt = Instant.now();
        }
    }

    public void changeTopic(CurriculumTopic newTopic) {
        this.curriculumTopic = newTopic;
    }

    public Long getId() { return id; }
    public Teacher getTeacher() { return teacher; }
    public CurriculumTopic getCurriculumTopic() { return curriculumTopic; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getEndedAt() { return endedAt; }
    public Status getStatus() { return status; }
}