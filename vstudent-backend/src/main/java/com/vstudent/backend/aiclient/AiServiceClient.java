package com.vstudent.backend.aiclient;

import com.vstudent.backend.aiclient.dto.ChildTurnRequestDto;
import com.vstudent.backend.aiclient.dto.ChildTurnResponseDto;
import com.vstudent.backend.aiclient.dto.SttResponseDto;
import com.vstudent.backend.aiclient.dto.TeacherAnalysisRequestDto;
import com.vstudent.backend.aiclient.dto.TeacherAnalysisResponseDto;
import com.vstudent.backend.aiclient.dto.TeacherSignalDto;
import com.vstudent.backend.aiclient.dto.TtsRequestDto;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class AiServiceClient {

    private final RestClient restClient;

    public AiServiceClient(RestClient aiServiceRestClient) {
        this.restClient = aiServiceRestClient;
    }

    public Map<String, Object> checkHealth() {
        return restClient.get()
                .uri("/internal/health")
                .retrieve()
                .body(Map.class);
    }

    public ChildTurnResponseDto submitChildTurn(ChildTurnRequestDto request) {
        return restClient.post()
                .uri("/internal/child-turn")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(ChildTurnResponseDto.class);
    }

    public SttResponseDto transcribeAudio(byte[] audioBytes, String filename, String contentType) {
        // FastAPI: `audio: UploadFile = File(...)` — "audio" adlı multipart fayl hissəsi.
        HttpHeaders partHeaders = new HttpHeaders();
        partHeaders.setContentDisposition(ContentDisposition.formData().name("audio").filename(filename).build());
        partHeaders.setContentType(MediaType.parseMediaType(contentType));

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("audio", new HttpEntity<>(new ByteArrayResource(audioBytes), partHeaders));

        try {
            return restClient.post()
                    .uri("/internal/stt")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(SttResponseDto.class);
        } catch (HttpClientErrorException e) {
            // 400/422 + mətn "detail" — səsin özü yararsızdır (boş, nitq yoxdur): istifadəçiyə qaytarılır.
            // Digər 4xx (məs. sxem xətası, detail siyahıdır) inteqrasiya problemidir və olduğu kimi atılır.
            String detail = textualDetail(e);
            if (detail != null && (e.getStatusCode().value() == 400 || e.getStatusCode().value() == 422)) {
                throw new IllegalStateException(detail);
            }
            throw e;
        }
    }

    private static String textualDetail(HttpClientErrorException e) {
        try {
            Map<?, ?> body = e.getResponseBodyAs(Map.class);
            return body != null && body.get("detail") instanceof String detail ? detail : null;
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    public byte[] synthesizeSpeech(String text) {
        return restClient.post()
                .uri("/internal/tts")
                .contentType(MediaType.APPLICATION_JSON)
                .body(new TtsRequestDto(text))
                .retrieve()
                .body(byte[].class);
    }

    public List<TeacherSignalDto> analyzeTeacherTurn(TeacherAnalysisRequestDto request) {
        TeacherAnalysisResponseDto response = restClient.post()
                .uri("/internal/teacher-analysis")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(TeacherAnalysisResponseDto.class);
        return response != null ? response.signals() : List.of();
    }
}