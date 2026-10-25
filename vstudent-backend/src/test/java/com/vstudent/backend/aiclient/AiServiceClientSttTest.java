package com.vstudent.backend.aiclient;

import com.sun.net.httpserver.HttpServer;
import com.vstudent.backend.aiclient.config.RestClientConfig;
import com.vstudent.backend.aiclient.dto.SttResponseDto;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.HttpClientErrorException;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AiServiceClientSttTest {

    private HttpServer server;
    private AiServiceClient client;
    private final AtomicReference<Map<String, List<String>>> capturedHeaders = new AtomicReference<>();
    private final AtomicReference<String> capturedBody = new AtomicReference<>();
    private volatile int responseStatus = 200;
    private volatile String responseJson = "{\"transcribedText\":\"two plus three is five\",\"durationSeconds\":2.5}";

    @BeforeEach
    void startServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/internal/stt", exchange -> {
            capturedHeaders.set(Map.copyOf(exchange.getRequestHeaders()));
            capturedBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.ISO_8859_1));
            byte[] response = responseJson.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(responseStatus, response.length);
            try (OutputStream out = exchange.getResponseBody()) {
                out.write(response);
            }
        });
        server.start();
        String baseUrl = "http://127.0.0.1:" + server.getAddress().getPort();
        client = new AiServiceClient(new RestClientConfig().aiServiceRestClient(baseUrl));
    }

    @AfterEach
    void stopServer() {
        server.stop(0);
    }

    @Test
    void sendsRecordedAudioAsMultipartFilePartNamedAudio() {
        byte[] audio = "\u001aEß£webm-audio-bytes".getBytes(StandardCharsets.ISO_8859_1);

        SttResponseDto response = client.transcribeAudio(audio, "recording.webm", "audio/webm;codecs=opus");

        assertThat(response.transcribedText()).isEqualTo("two plus three is five");
        assertThat(response.durationSeconds()).isEqualTo(2.5);

        // uvicorn "Upgrade: h2c" olan sorğunun body-sini atır — bu header heç vaxt getməməlidir.
        assertThat(capturedHeaders.get().keySet()).noneMatch(name -> name.equalsIgnoreCase("Upgrade"));
        assertThat(capturedHeaders.get().get("Content-type").get(0)).startsWith("multipart/form-data");

        String body = capturedBody.get();
        assertThat(body).contains("Content-Disposition: form-data; name=\"audio\"; filename=\"recording.webm\"");
        assertThat(body).contains("Content-Type: audio/webm;codecs=opus");
        assertThat(body).contains(new String(audio, StandardCharsets.ISO_8859_1));
    }

    @Test
    void unusableAudioRejectionBecomesClientFacingError() {
        responseStatus = 422;
        responseJson = "{\"detail\":\"Could not transcribe any speech from the audio.\"}";

        assertThatThrownBy(() -> client.transcribeAudio(new byte[]{1, 2, 3}, "recording.webm", "audio/webm"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Could not transcribe any speech from the audio.");
    }

    @Test
    void schemaValidationErrorIsTreatedAsIntegrationFailure() {
        responseStatus = 422;
        responseJson = "{\"detail\":[{\"type\":\"missing\",\"loc\":[\"body\",\"audio\"],\"msg\":\"Field required\",\"input\":null}]}";

        assertThatThrownBy(() -> client.transcribeAudio(new byte[]{1, 2, 3}, "recording.webm", "audio/webm"))
                .isInstanceOf(HttpClientErrorException.UnprocessableEntity.class);
    }
}
