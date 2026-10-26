import { useRef, useState, type FormEvent } from 'react';
import { useAudioRecorder } from './useAudioRecorder';

interface TurnInputProps {
    onSubmitText: (text: string) => Promise<void>;
    onSubmitAudio: (blob: Blob) => Promise<void>;
}

export function TurnInput({ onSubmitText, onSubmitAudio }: TurnInputProps) {
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const pending = useRef(false);
    const [error, setError] = useState<string | null>(null);
    const recorder = useAudioRecorder();

    async function handleTextSubmit(e: FormEvent) {
        e.preventDefault();
        if (!text.trim() || pending.current || recorder.status === 'recording') return;
        pending.current = true;
        setError(null);
        setSubmitting(true);
        try {
            await onSubmitText(text.trim());
            setText('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Your message could not be sent. Please try again.');
        } finally {
            pending.current = false;
            setSubmitting(false);
        }
    }

    async function handleRecordToggle() {
        if (pending.current) return;
        pending.current = true;
        setSubmitting(true);
        setError(null);
        try {
            if (recorder.status === 'recording') {
                const blob = await recorder.stop();
                if (blob) await onSubmitAudio(blob);
            } else {
                await recorder.start();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Your recording could not be sent. Please record again.');
        } finally {
            pending.current = false;
            setSubmitting(false);
        }
    }

    const busy = submitting;

    return (
        <div style={{ marginTop: '1rem' }} aria-busy={busy}>
            <form className="turn-form" onSubmit={handleTextSubmit}>
                <input
                    aria-label="Message to Lumi"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Say something to the child..."
                    disabled={busy || recorder.status === 'recording'}
                />
                <button type="submit" disabled={busy || !text.trim() || recorder.status === 'recording'}>
                    {busy ? 'Please wait...' : 'Send'}
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
            {error && <p className="form-error" role="alert">{error}</p>}
            {submitting && <p role="status" style={{ color: '#666', fontSize: '0.85rem' }}>Waiting for the child's response...</p>}
        </div>
    );
}
