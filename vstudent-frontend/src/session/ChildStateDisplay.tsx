import type { ChildStateResponse } from '../api/types';

const EMOTION_EMOJI: Record<string, string> = {
    NEUTRAL: '😐',
    CONFIDENT: '😊',
    CURIOUS: '🤔',
    SHY: '😳',
    FRUSTRATED: '😤',
    TIRED: '😴',
};

function Bar({ label, value }: { label: string; value: number }) {
    const pct = Math.round(value * 100);
    return (
        <div style={{ marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span>{label}</span>
                <span>{pct}%</span>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: 4, height: 6 }}>
                <div style={{ width: `${pct}%`, background: '#2563eb', height: 6, borderRadius: 4 }} />
            </div>
        </div>
    );
}

export function ChildStateDisplay({ state }: { state: ChildStateResponse | null }) {
    if (!state) {
        return <p style={{ color: '#666' }}>No turns yet.</p>;
    }

    return (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem' }}>
            <p style={{ marginTop: 0 }}>
                {EMOTION_EMOJI[state.emotionalState] ?? ''} <strong>{state.emotionalState}</strong>
                {' · turn '}
                {state.turnCount}
            </p>
            <Bar label="Attention" value={state.attention} />
            <Bar label="Engagement" value={state.engagement} />
            <Bar label="Confidence" value={state.confidence} />
            <Bar label="Motivation" value={state.motivation} />
            <Bar label="Curiosity" value={state.curiosity} />
            <Bar label="Frustration" value={state.frustration} />
            <Bar label="Fatigue" value={state.fatigue} />
        </div>
    );
}