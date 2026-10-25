package com.vstudent.backend.api.curriculum;

import com.vstudent.backend.api.curriculum.dto.request.CurriculumTopicRequest;
import com.vstudent.backend.api.curriculum.dto.response.CurriculumTopicResponse;
import com.vstudent.backend.curriculum.CurriculumService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/curriculum-topics")
public class CurriculumController {

    private final CurriculumService curriculumService;

    public CurriculumController(CurriculumService curriculumService) {
        this.curriculumService = curriculumService;
    }

    @GetMapping
    public List<CurriculumTopicResponse> listTopics() {
        return curriculumService.listAll().stream()
                .map(CurriculumTopicResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CurriculumTopicResponse create(@Valid @RequestBody CurriculumTopicRequest request) {
        return CurriculumTopicResponse.from(curriculumService.create(request));
    }

    @PutMapping("/{id}")
    public CurriculumTopicResponse update(@PathVariable Long id, @Valid @RequestBody CurriculumTopicRequest request) {
        return CurriculumTopicResponse.from(curriculumService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        curriculumService.delete(id);
    }
}