import type { ChildStateResponse } from '../api/types';
import { Lumi } from '../ui/Lumi';
import { MOODS, normalizeMood } from '../ui/moods';

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
    const pct = Math.round(value * 100);
    return (
        <div className="bar">
            <div className="bar-top">
                <span>{label}</span>
                <span>{pct}%</span>
            </div>
            <div className="bar-track">
                <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
}

export function ChildStateDisplay({ state }: { state: ChildStateResponse | null }) {
    const mood = normalizeMood(state?.emotionalState);
    const meta = MOODS[mood];

    return (
        <div className="card mood-panel">
            <div className="mood-stage" style={{ background: meta.bg }}>
                <span className="mood-name" style={{ color: meta.fg }}>{state ? meta.label : 'Waiting for you'}</span>
                <Lumi mood={mood} size={190} body label={`Lumi looks ${meta.label.toLowerCase()}`} />
            </div>
            {!state ? (
                <p style={{ color: 'var(--muted)', margin: 0 }}>No turns yet. Say hello to Lumi.</p>
            ) : (
                <>
                    <p style={{ margin: '0 0 10px', color: 'var(--muted)', fontSize: '0.85rem' }}>Turn {state.turnCount}</p>
                    <Bar label="Attention" value={state.attention} color="#6fb4ff" />
                    <Bar label="Engagement" value={state.engagement} color="#9b7bff" />
                    <Bar label="Confidence" value={state.confidence} color="#5fd3a8" />
                    <Bar label="Motivation" value={state.motivation} color="#ffc933" />
                    <Bar label="Curiosity" value={state.curiosity} color="#ff9aa2" />
                    <Bar label="Frustration" value={state.frustration} color="#ff6b5a" />
                    <Bar label="Fatigue" value={state.fatigue} color="#a39bcb" />
                </>
            )}
        </div>
    );
}