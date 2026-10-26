import type { Credentials, Turn } from '../api/types';
import { Lumi } from '../ui/Lumi';
import { normalizeMood } from '../ui/moods';
import { TurnAudioPlayer } from './TurnAudioPlayer';

const OUTCOME_LABEL: Record<string, string> = {
    CORRECT: 'Correct',
    INCORRECT: 'Incorrect',
    NEEDS_CLARIFICATION: 'Needed clarification',
    DISTRACTED: 'Distracted',
};

export function TurnHistory({ turns, credentials }: { turns: Turn[]; credentials: Credentials }) {
    if (turns.length === 0) {
        return <p style={{ color: 'var(--muted)' }}>No turns yet. Say something to Lumi to begin.</p>;
    }

    return (
        <div>
            {turns.map((turn) => (
                <div key={turn.id}>
                    <div className="chat-row teacher">
                        <div className="bubble">{turn.teacherUtteranceText}</div>
                    </div>
                    <div className="chat-row child">
                        <div className="chat-avatar">
                            <Lumi mood={normalizeMood(turn.childState?.emotionalState)} size={48} />
                        </div>
                        <div className="bubble">
                            {turn.childResponseText}
                            <small>
                                {OUTCOME_LABEL[turn.outcome] ?? turn.outcome}
                                {turn.validationPassed === false && ' · fallback reply (AI response unavailable or rejected)'}
                            </small>
                            {turn.audioUrl && (
                                <div style={{ marginTop: 6 }}>
                                    <TurnAudioPlayer audioUrl={turn.audioUrl} credentials={credentials} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}