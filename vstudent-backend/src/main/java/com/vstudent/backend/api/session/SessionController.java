package com.vstudent.backend.api.session;

import com.vstudent.backend.api.session.dto.request.ChangeTopicRequest;
import com.vstudent.backend.api.session.dto.response.SessionReportResponse;
import com.vstudent.backend.api.session.dto.response.SessionResponse;
import com.vstudent.backend.api.session.dto.response.SessionSummaryResponse;
import com.vstudent.backend.api.session.dto.request.StartSessionRequest;
import com.vstudent.backend.api.session.dto.request.SubmitTurnRequest;
import com.vstudent.backend.api.session.dto.response.TurnResponse;
import com.vstudent.backend.evaluation.report.ReportGenerationService;
import com.vstudent.backend.persistence.entity.session.Session;
import com.vstudent.backend.session.SessionService;
import com.vstudent.backend.session.turn.TurnService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions")
public class SessionController {

    private final SessionService sessionService;
    private final TurnService turnService;
    private final ReportGenerationService reportGenerationService;

    public SessionController(SessionService sessionService, TurnService turnService,
                              ReportGenerationService reportGenerationService) {
        this.sessionService = sessionService;
        this.turnService = turnService;
        this.reportGenerationService = reportGenerationService;
    }

    @PostMapping
    public SessionResponse startSession(@Valid @RequestBody StartSessionRequest request) {
        return SessionResponse.from(sessionService.startSession(request.curriculumTopicId()));
    }

    @GetMapping
    public List<SessionSummaryResponse> listSessions() {
        return sessionService.listSessionsForCurrentTeacher().stream()
                .map(this::toSummary)
                .toList();
    }

    @GetMapping("/{id}")
    public SessionResponse getSession(@PathVariable Long id) {
        return SessionResponse.from(sessionService.getSession(id));
    }

    @PostMapping("/{id}/end")
    public SessionResponse endSession(@PathVariable Long id) {
        return SessionResponse.from(sessionService.endSession(id));
    }

    @PostMapping("/{id}/topic")
    public SessionResponse changeTopic(@PathVariable Long id, @Valid @RequestBody ChangeTopicRequest request) {
        return SessionResponse.from(sessionService.changeTopic(id, request.curriculumTopicId()));
    }

    @GetMapping("/{id}/report")
    public SessionReportResponse getReport(@PathVariable Long id) {
        sessionService.getSession(id); // sahiblik yoxlaması
        return SessionReportResponse.from(reportGenerationService.getReport(id));
    }

    @PostMapping("/{id}/turns")
    public TurnResponse submitTurn(@PathVariable Long id, @Valid @RequestBody SubmitTurnRequest request) {
        TurnService.TurnWithState result = turnService.submitTurn(id, request.teacherUtterance());
        return TurnResponse.from(result.turn(), result.state(), result.signals(), result.guidance());
    }

    @PostMapping(value = "/{id}/turns/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TurnResponse submitAudioTurn(@PathVariable Long id, @RequestParam("audio") MultipartFile audio) {
        TurnService.TurnWithState result = turnService.submitAudioTurn(id, audio);
        return TurnResponse.from(result.turn(), result.state(), result.signals(), result.guidance());
    }

    @GetMapping("/{id}/turns")
    public List<TurnResponse> getTurns(@PathVariable Long id) {
        sessionService.getSession(id); // sahiblik yoxlaması
        return turnService.getTurnsForSession(id).stream()
                .map(r -> TurnResponse.from(r.turn(), r.state(), r.signals(), r.guidance()))
                .toList();
    }

    private SessionSummaryResponse toSummary(Session session) {
        return SessionSummaryResponse.from(session, turnService.countTurnsForSession(session.getId()));
    }
}