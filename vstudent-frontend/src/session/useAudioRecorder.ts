import { useCallback, useRef, useState } from 'react';

type RecorderStatus = 'idle' | 'recording' | 'error';

const PREFERRED_MIME_TYPES = ['audio/webm', 'audio/ogg', 'audio/mp4'];

function pickSupportedMimeType(): string | undefined {
    if (typeof MediaRecorder === 'undefined') return undefined;
    return PREFERRED_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

export function useAudioRecorder() {
    const [status, setStatus] = useState<RecorderStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const start = useCallback(async () => {
        setError(null);

        if (!navigator.mediaDevices?.getUserMedia) {
            setError('Microphone access is not available in this browser.');
            setStatus('error');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mimeType = pickSupportedMimeType();
            const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
            chunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setStatus('recording');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not access the microphone.');
            setStatus('error');
        }
    }, []);

    const stop = useCallback((): Promise<Blob | null> => {
        return new Promise((resolve) => {
            const recorder = mediaRecorderRef.current;
            if (!recorder || recorder.state === 'inactive') {
                resolve(null);
                return;
            }
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
                streamRef.current?.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
                setStatus('idle');
                resolve(blob);
            };
            recorder.stop();
        });
    }, []);

    return { status, error, start, stop };
}