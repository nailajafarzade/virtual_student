package com.vstudent.backend.session;

import com.vstudent.backend.evaluation.report.ReportGenerationService;
import com.vstudent.backend.persistence.entity.curriculum.CurriculumTopic;
import com.vstudent.backend.persistence.entity.session.Session;
import com.vstudent.backend.persistence.entity.teacher.Teacher;
import com.vstudent.backend.persistence.repository.curriculum.CurriculumTopicRepository;
import com.vstudent.backend.persistence.repository.session.SessionRepository;
import com.vstudent.backend.persistence.repository.teacher.TeacherRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;
    private final CurriculumTopicRepository curriculumTopicRepository;
    private final TeacherRepository teacherRepository;
    private final ReportGenerationService reportGenerationService;

    public SessionService(SessionRepository sessionRepository,
                           CurriculumTopicRepository curriculumTopicRepository,
                           TeacherRepository teacherRepository,
                           ReportGenerationService reportGenerationService) {
        this.sessionRepository = sessionRepository;
        this.curriculumTopicRepository = curriculumTopicRepository;
        this.teacherRepository = teacherRepository;
        this.reportGenerationService = reportGenerationService;
    }

    public Session startSession(Long curriculumTopicId) {
        Teacher teacher = currentTeacher();
        CurriculumTopic topic = curriculumTopicRepository.findById(curriculumTopicId)
                .orElseThrow(() -> new NoSuchElementException("Curriculum topic not found: " + curriculumTopicId));
        return sessionRepository.save(new Session(teacher, topic));
    }

    public Session getSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NoSuchElementException("Session not found: " + sessionId));
        Teacher requester = currentTeacher();
        if (!session.getTeacher().getId().equals(requester.getId())) {
            throw new NoSuchElementException("Session not found: " + sessionId);
        }
        return session;
    }

    public List<Session> listSessionsForCurrentTeacher() {
        Teacher teacher = currentTeacher();
        return sessionRepository.findByTeacherIdOrderByStartedAtDesc(teacher.getId());
    }

    public List<Session> listSessionsForTeacher(Long teacherId) {
        return sessionRepository.findByTeacherIdOrderByStartedAtDesc(teacherId);
    }

    public Session changeTopic(Long sessionId, Long newTopicId) {
        Session session = getSession(sessionId);
        if (session.getStatus() == Session.Status.ENDED) {
            throw new IllegalStateException("Cannot change topic on an ended session.");
        }
        CurriculumTopic newTopic = curriculumTopicRepository.findById(newTopicId)
                .orElseThrow(() -> new NoSuchElementException("Curriculum topic not found: " + newTopicId));
        session.changeTopic(newTopic);
        return sessionRepository.save(session);
    }

    public Session endSession(Long sessionId) {
        Session session = getSession(sessionId);
        session.end();
        Session saved = sessionRepository.save(session);
        reportGenerationService.generateReport(saved);
        return saved;
    }

    private Teacher currentTeacher() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return teacherRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Teacher not found: " + email));
    }
}