import { useEffect, useState } from 'react';
import type { ProgressResponse } from '../api/types';
import { getProgress, getTeacherProgress } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const DIRECTION_ICON: Record<string, string> = {
    up: '📈',
    down: '📉',
    flat: '➡️',
    insufficient_data: '—',
};

function pct(value: number | null): string {
    return value == null ? '—' : `${Math.round(value * 100)}%`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
}

interface ProgressViewProps {
    onBack: () => void;
    teacherId?: number;
    teacherName?: string;
}

export function ProgressView({ onBack, teacherId, teacherName }: ProgressViewProps) {
    const { auth } = useAuth();
    const [progress, setProgress] = useState<ProgressResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!auth) return;
        const fetcher = teacherId != null
            ? getTeacherProgress(auth.credentials, teacherId)
            : getProgress(auth.credentials);
        fetcher
            .then(setProgress)
            .catch((err) => setError(err instanceof Error ? err.message : 'Could not load progress.'));
    }, [auth, teacherId]);

    return (
        <div>
            <button onClick={onBack} style={{ marginBottom: '1rem' }}>
                ← Back
            </button>
            <h2>{teacherName ? `${teacherName}'s progress` : 'Your progress'}</h2>

            {error && <p style={{ color: 'crimson' }}>{error}</p>}
            {!progress && !error && <p>Loading...</p>}

            {progress && (
                <>
                    <p>{progress.narrativeText}</p>

                    {progress.trends.some((t) => t.direction !== 'insufficient_data') && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: '0.75rem',
                                margin: '1rem 0',
                            }}
                        >
                            {progress.trends
                                .filter((t) => t.direction !== 'insufficient_data')
                                .map((trend) => (
                                    <div key={trend.metricName} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{trend.metricName}</div>
                                        <div style={{ fontSize: '1.4rem' }}>
                                            {DIRECTION_ICON[trend.direction]} {pct(trend.mostRecent)}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#999' }}>was ~{pct(trend.previousAverage)}</div>
                                    </div>
                                ))}
                        </div>
                    )}

                    {progress.sessions.length > 0 && (
                        <>
                            <h3>Session history</h3>
                            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.9rem' }}>
                                <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={{ padding: '0.4rem' }}>Date</th>
                                    <th style={{ padding: '0.4rem' }}>Topic</th>
                                    <th style={{ padding: '0.4rem' }}>Turns</th>
                                    <th style={{ padding: '0.4rem' }}>Encouragement</th>
                                    <th style={{ padding: '0.4rem' }}>Open Qs</th>
                                </tr>
                                </thead>
                                <tbody>
                                {progress.sessions.map((s) => (
                                    <tr key={s.sessionId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '0.4rem' }}>{formatDate(s.startedAt)}</td>
                                        <td style={{ padding: '0.4rem' }}>{s.curriculumTopicName}</td>
                                        <td style={{ padding: '0.4rem' }}>{s.totalTurns}</td>
                                        <td style={{ padding: '0.4rem' }}>{pct(s.encouragementRate)}</td>
                                        <td style={{ padding: '0.4rem' }}>{pct(s.openQuestionRatio)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </>
            )}
        </div>
    );
}