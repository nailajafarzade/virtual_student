import type { Credentials, Turn } from '../api/types';
import { TurnAudioPlayer } from './TurnAudioPlayer';

const OUTCOME_LABEL: Record<string, string> = {
    CORRECT: '✅ Correct',
    INCORRECT: '❌ Incorrect',
    NEEDS_CLARIFICATION: '❓ Needed clarification',
    DISTRACTED: '💭 Distracted',
};

export function TurnHistory({ turns, credentials }: { turns: Turn[]; credentials: Credentials }) {
    if (turns.length === 0) {
        return <p style={{ color: '#666' }}>No turns yet — say something to the child to begin.</p>;
    }

    return (
        <div>
            {turns.map((turn) => (
                <div key={turn.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                    <p style={{ margin: '0 0 0.25rem' }}>
                        <strong>Teacher:</strong> {turn.teacherUtteranceText}
                    </p>
                    <p style={{ margin: '0 0 0.25rem' }}>
                        <strong>Child:</strong> {turn.childResponseText}{' '}
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>
              ({OUTCOME_LABEL[turn.outcome] ?? turn.outcome})
            </span>
                    </p>
                    {turn.audioUrl && <TurnAudioPlayer audioUrl={turn.audioUrl} credentials={credentials} />}
                </div>
            ))}
        </div>
    );
}