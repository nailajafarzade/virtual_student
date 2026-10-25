package com.vstudent.backend.persistence.entity.teacher;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "teacher")
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeacherRole role;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Teacher() {
    }

    public Teacher(String name, String email, String passwordHash) {
        this(name, email, passwordHash, TeacherRole.TEACHER);
    }

    public Teacher(String name, String email, String passwordHash, TeacherRole role) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = Instant.now();
    }

    public void changeRole(TeacherRole newRole) {
        this.role = newRole;
    }

    public void changePasswordHash(String newPasswordHash) {
        this.passwordHash = newPasswordHash;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public TeacherRole getRole() { return role; }
    public Instant getCreatedAt() { return createdAt; }
}