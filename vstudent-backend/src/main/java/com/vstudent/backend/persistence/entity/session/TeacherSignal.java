package com.vstudent.backend.persistence.entity.session;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "teacher_signal")
public class TeacherSignal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "turn_id", nullable = false)
    private Long turnId;

    @Enumerated(EnumType.STRING)
    @Column(name = "signal_type", nullable = false)
    private SignalType signalType;

    @Column(nullable = false, length = 500)
    private String value;

    protected TeacherSignal() {
    }

    public TeacherSignal(Long turnId, SignalType signalType, String value) {
        this.turnId = turnId;
        this.signalType = signalType;
        this.value = value;
    }

    public Long getId() { return id; }
    public Long getTurnId() { return turnId; }
    public SignalType getSignalType() { return signalType; }
    public String getValue() { return value; }
}