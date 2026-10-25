package com.vstudent.backend.curriculum;

import com.vstudent.backend.api.curriculum.dto.request.CurriculumTopicRequest;
import com.vstudent.backend.persistence.entity.curriculum.CurriculumTopic;
import com.vstudent.backend.persistence.repository.curriculum.CurriculumTopicRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CurriculumService {

    private final CurriculumTopicRepository repository;

    public CurriculumService(CurriculumTopicRepository repository) {
        this.repository = repository;
    }

    public List<CurriculumTopic> listAll() {
        return repository.findAll();
    }

    public CurriculumTopic create(CurriculumTopicRequest request) {
        CurriculumTopic topic = new CurriculumTopic(request.name(), request.objective(), request.difficultyLevel());
        topic.update(request.name(), request.objective(), request.difficultyLevel(),
                orEmpty(request.exampleQuestions()), orEmpty(request.acceptableAnswers()),
                orEmpty(request.commonMisconceptions()));
        return save(topic);
    }

    public CurriculumTopic update(Long id, CurriculumTopicRequest request) {
        CurriculumTopic topic = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Curriculum topic not found: " + id));
        topic.update(request.name(), request.objective(), request.difficultyLevel(),
                orEmpty(request.exampleQuestions()), orEmpty(request.acceptableAnswers()),
                orEmpty(request.commonMisconceptions()));
        return save(topic);
    }

    public void delete(Long id) {
        CurriculumTopic topic = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Curriculum topic not found: " + id));
        try {
            repository.delete(topic);
            repository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("This topic is used by existing sessions and cannot be deleted.");
        }
    }

    private CurriculumTopic save(CurriculumTopic topic) {
        try {
            return repository.saveAndFlush(topic);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("A topic with this name already exists.");
        }
    }

    private static List<String> orEmpty(List<String> list) {
        return list != null ? list : List.of();
    }
}