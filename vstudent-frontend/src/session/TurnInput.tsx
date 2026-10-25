import { useState, type FormEvent } from 'react';
import { useAudioRecorder } from './useAudioRecorder';

interface TurnInputProps {
    onSubmitText: (text: string) => Promise<void>;
    onSubmitAudio: (blob: Blob) => Promise<void>;
}

export function TurnInput({ onSubmitText, onSubmitAudio }: TurnInputProps) {
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const recorder = useAudioRecorder();

    async function handleTextSubmit(e: FormEvent) {
        e.preventDefault();
        if (!text.trim()) return;
        setSubmitting(true);
        try {
            await onSubmitText(text.trim());
            setText('');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRecordToggle() {
        if (recorder.status === 'recording') {
            const blob = await recorder.stop();
            if (blob) {
                setSubmitting(true);
                try {
                    await onSubmitAudio(blob);
                } finally {
                    setSubmitting(false);
                }
            }
        } else {
            await recorder.start();
        }
    }

    const busy = submitting;

    return (
        <div style={{ marginTop: '1rem' }}>
            <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Say something to the child..."
                    disabled={busy || recorder.status === 'recording'}
                    style={{ flex: 1 }}
                />
                <button type="submit" disabled={busy || !text.trim() || recorder.status === 'recording'}>
                    Send
                </button>
            </form>
            <div style={{ marginTop: '0.5rem' }}>
                <button
                    type="button"
                    onClick={handleRecordToggle}
                    disabled={busy}
                    style={recorder.status === 'recording' ? { background: '#dc2626' } : undefined}
                >
                    {recorder.status === 'recording' ? '⏹ Stop recording' : '🎤 Record instead'}
                </button>
                {recorder.error && <p style={{ color: 'crimson', fontSize: '0.85rem' }}>{recorder.error}</p>}
            </div>
            {submitting && <p style={{ color: '#666', fontSize: '0.85rem' }}>Waiting for the child's response...</p>}
        </div>
    );
}