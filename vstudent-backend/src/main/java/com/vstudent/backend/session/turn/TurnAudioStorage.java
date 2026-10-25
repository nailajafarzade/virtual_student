package com.vstudent.backend.session.turn;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class TurnAudioStorage {

    private final Path storageDir;

    public TurnAudioStorage(@Value("${turn-audio.storage-dir}") String storageDirPath) {
        this.storageDir = Paths.get(storageDirPath);
        try {
            Files.createDirectories(this.storageDir);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not create audio storage directory: " + this.storageDir, e);
        }
    }

    public String save(Long sessionId, Integer sequenceNo, byte[] audioBytes) {
        String filename = "session-%d-seq-%d.wav".formatted(sessionId, sequenceNo);
        try {
            Files.write(storageDir.resolve(filename), audioBytes);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not write audio file: " + filename, e);
        }
        return filename;
    }

    public byte[] read(String audioRef) {
        try {
            return Files.readAllBytes(storageDir.resolve(audioRef));
        } catch (IOException e) {
            throw new UncheckedIOException("Could not read audio file: " + audioRef, e);
        }
    }
}