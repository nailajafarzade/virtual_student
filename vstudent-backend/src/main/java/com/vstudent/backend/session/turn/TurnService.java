package com.vstudent.backend.session.turn;

import com.vstudent.backend.session.SessionService;

import com.vstudent.backend.aiclient.AiServiceClient;
import com.vstudent.backend.aiclient.dto.ChildStateDto;
import com.vstudent.backend.aiclient.dto.ChildTurnRequestDto;
import com.vstudent.backend.aiclient.dto.ChildTurnResponseDto;
import com.vstudent.backend.aiclient.dto.CurriculumTopicDto;
import com.vstudent.backend.aiclient.dto.SttResponseDto;
import com.vstudent.backend.aiclient.dto.TeacherAnalysisRequestDto;
import com.vstudent.backend.aiclient.dto.TeacherSignalDto;
import com.vstudent.backend.childstate.ChildStateMapper;
import com.vstudent.backend.lessonengine.LessonEngineService;
import com.vstudent.backend.persistence.entity.childstate.ChildState;
import com.vstudent.backend.persistence.entity.curriculum.CurriculumTopic;
import com.vstudent.backend.persistence.entity.session.Session;
import com.vstudent.backend.persistence.entity.session.SignalType;
import com.vstudent.backend.persistence.entity.session.TeacherSignal;
import com.vstudent.backend.persistence.entity.session.Turn;
import com.vstudent.backend.persistence.entity.session.TurnOutcome;
import com.vstudent.backend.persistence.repository.childstate.ChildStateRepository;
import com.vstudent.backend.persistence.repository.session.TeacherSignalRepository;
import com.vstudent.backend.persistence.repository.session.TurnRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class TurnService {

    private static final Logger log = LoggerFactory.getLogger(TurnService.class);

    private final SessionService sessionService;
    private final TurnRepository turnRepository;
    private final ChildStateRepository childStateRepository;
    private final TeacherSignalRepository teacherSignalRepository;
    private final AiServiceClient aiServiceClient;
    private final TurnAudioStorage turnAudioStorage;
    private final LessonEngineService lessonEngineService;

    public TurnService(SessionService sessionService,
                        TurnRepository turnRepository,
                        ChildStateRepository childStateRepository,
                        TeacherSignalRepository teacherSignalRepository,
                        AiServiceClient aiServiceClient,
                        TurnAudioStorage turnAudioStorage,
                        LessonEngineService lessonEngineService) {
        this.sessionService = sessionService;
        this.turnRepository = turnRepository;
        this.childStateRepository = childStateRepository;
        this.teacherSignalRepository = teacherSignalRepository;
        this.aiServiceClient = aiServiceClient;
        this.turnAudioStorage = turnAudioStorage;
        this.lessonEngineService = lessonEngineService;
    }

    public record TurnWithState(Turn turn, ChildState state, List<TeacherSignal> signals,
                                 LessonEngineService.LessonGuidance guidance) {
    }

    public TurnWithState submitTurn(Long sessionId, String teacherUtterance) {
        Session session = sessionService.getSession(sessionId);
        ensureActive(session);
        return submitTurnInternal(session, teacherUtterance, null);
    }

    public TurnWithState submitAudioTurn(Long sessionId, MultipartFile audioFile) {
        Session session = sessionService.getSession(sessionId);
        ensureActive(session);
        SttResponseDto sttResponse = transcribe(audioFile);
        return submitTurnInternal(session, sttResponse.transcribedText(), sttResponse.durationSeconds());
    }

    public byte[] getAudioForTurn(Long turnId) {
        Turn turn = turnRepository.findById(turnId)
                .orElseThrow(() -> new NoSuchElementException("Turn not found: " + turnId));
        sessionService.getSession(turn.getSession().getId());
        String audioRef = turn.getChildResponseAudioRef();
        if (audioRef == null) {
            throw new NoSuchElementException("No audio available for turn: " + turnId);
        }
        return turnAudioStorage.read(audioRef);
    }

    private void ensureActive(Session session) {
        if (session.getStatus() == Session.Status.ENDED) {
            throw new IllegalStateException("Cannot submit a turn to an ended session.");
        }
    }

    private SttResponseDto transcribe(MultipartFile audioFile) {
        String contentType = audioFile.getContentType();
        if (contentType == null || !contentType.startsWith("audio/")) {
            throw new IllegalStateException("Uploaded file does not appear to be audio (content-type: " + contentType + ").");
        }
        if (audioFile.isEmpty()) {
            throw new IllegalStateException("Uploaded audio file is empty.");
        }

        byte[] audioBytes;
        try {
            audioBytes = audioFile.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to read uploaded audio file", e);
        }

        String filename = audioFile.getOriginalFilename() != null ? audioFile.getOriginalFilename() : "audio.webm";
        SttResponseDto sttResponse = aiServiceClient.transcribeAudio(audioBytes, filename, contentType);

        if (sttResponse.transcribedText() == null || sttResponse.transcribedText().isBlank()) {
            throw new IllegalStateException("Could not transcribe any speech from the audio.");
        }
        return sttResponse;
    }

    private TurnWithState submitTurnInternal(Session session, String teacherUtterance, Double speechDurationSeconds) {
        Long sessionId = session.getId();
        CurriculumTopic topic = session.getCurriculumTopic();

        List<Turn> existingTurns = turnRepository.findBySessionIdOrderBySequenceNoAsc(sessionId);
        int nextSequenceNo = existingTurns.size() + 1;
        Turn previousTurn = existingTurns.isEmpty() ? null : existingTurns.get(existingTurns.size() - 1);

        List<TeacherSignalDto> teacherSignals = tryAnalyzeTeacherTurn(
                teacherUtterance,
                previousTurn != null ? previousTurn.getOutcome().name().toLowerCase() : null,
                previousTurn != null ? previousTurn.getChildResponseText() : null,
                speechDurationSeconds
        );

        ChildStateDto currentStateDto = childStateRepository.findTopBySessionIdOrderByIdDesc(sessionId)
                .map(ChildStateMapper::toDto)
                .orElse(null);

        CurriculumTopicDto topicDto = new CurriculumTopicDto(
                topic.getId(), topic.getName(), topic.getObjective(),
                topic.getExampleQuestions(), topic.getAcceptableAnswers(), topic.getCommonMisconceptions()
        );

        ChildTurnResponseDto aiResponse = aiServiceClient.submitChildTurn(
                new ChildTurnRequestDto(sessionId, nextSequenceNo, teacherUtterance, topicDto, currentStateDto)
        );

        if (Boolean.FALSE.equals(aiResponse.validationPassed())) {
            log.warn("Response validation failed for session={} turn={} outcome={} — AI service used a fallback response.",
                    sessionId, nextSequenceNo, aiResponse.outcome());
        }

        String audioRef = trySynthesizeAudio(sessionId, nextSequenceNo, aiResponse.childResponseText());

        TurnOutcome outcome = TurnOutcome.valueOf(aiResponse.outcome().toUpperCase());

        Turn turn = turnRepository.save(new Turn(
                session, nextSequenceNo, teacherUtterance, aiResponse.childResponseText(), audioRef,
                outcome, aiResponse.validationPassed()
        ));

        ChildState stateSnapshot = childStateRepository.save(
                ChildStateMapper.toEntity(aiResponse.updatedState(), sessionId, turn.getId())
        );

        List<TeacherSignal> savedSignals = saveTeacherSignals(turn.getId(), teacherSignals);

        LessonEngineService.LessonGuidance guidance = lessonEngineService.getGuidance(topic, stateSnapshot);

        return new TurnWithState(turn, stateSnapshot, savedSignals, guidance);
    }

    private List<TeacherSignalDto> tryAnalyzeTeacherTurn(String teacherUtterance, String previousOutcome,
                                                           String previousChildResponse, Double speechDurationSeconds) {
        try {
            return aiServiceClient.analyzeTeacherTurn(new TeacherAnalysisRequestDto(
                    teacherUtterance, previousOutcome, previousChildResponse, speechDurationSeconds
            ));
        } catch (Exception e) {
            log.warn("Teacher analysis failed: {}", e.getMessage());
            return List.of();
        }
    }

    private List<TeacherSignal> saveTeacherSignals(Long turnId, List<TeacherSignalDto> signals) {
        List<TeacherSignal> saved = new ArrayList<>();
        for (TeacherSignalDto signal : signals) {
            try {
                SignalType signalType = SignalType.valueOf(signal.signalType().toUpperCase());
                saved.add(teacherSignalRepository.save(new TeacherSignal(turnId, signalType, signal.value())));
            } catch (IllegalArgumentException e) {
                log.warn("Unknown signal type from AI service: {}", signal.signalType());
            }
        }
        return saved;
    }

    private String trySynthesizeAudio(Long sessionId, Integer sequenceNo, String text) {
        try {
            byte[] audioBytes = aiServiceClient.synthesizeSpeech(text);
            return turnAudioStorage.save(sessionId, sequenceNo, audioBytes);
        } catch (Exception e) {
            log.warn("TTS synthesis failed for session={} seq={}: {}", sessionId, sequenceNo, e.getMessage());
            return null;
        }
    }

    public long countTurnsForSession(Long sessionId) {
        return turnRepository.countBySessionId(sessionId);
    }

    public List<TurnWithState> getTurnsForSession(Long sessionId) {
        return turnRepository.findBySessionIdOrderBySequenceNoAsc(sessionId).stream()
                .map(t -> new TurnWithState(
                        t,
                        childStateRepository.findByTurnId(t.getId()).orElse(null),
                        teacherSignalRepository.findByTurnId(t.getId()),
                        null
                ))
                .toList();
    }
}