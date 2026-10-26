import { useEffect, useState } from 'react';
import type { SessionSummary } from '../api/types';
import { listSessions } from '../api/client';
import { useAuth } from '../auth/AuthContext';

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
}

interface SessionListProps {
    onStartNew: () => void;
    onResume: (sessionId: number) => void;
    onViewReport: (sessionId: number) => void;
    onViewProgress: () => void;
    onManageCurriculum: () => void;
    onViewAllTeachers: () => void;
}

export function SessionList({
                                onStartNew,
                                onResume,
                                onViewReport,
                                onViewProgress,
                                onManageCurriculum,
                                onViewAllTeachers,
                            }: SessionListProps) {
    const { auth } = useAuth();
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!auth) return;
        listSessions(auth.credentials)
            .then(setSessions)
            .catch((err) => setError(err instanceof Error ? err.message : 'Could not load sessions.'))
            .finally(() => setLoading(false));
    }, [auth]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ margin: 0 }}>Your sessions</h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {auth?.role === 'ADMIN' && <button onClick={onManageCurriculum}>📚 Curriculum</button>}
                    {auth?.role === 'ADMIN' && <button onClick={onViewAllTeachers}>👥 All teachers</button>}
                    <button onClick={onViewProgress}>📊 Your progress</button>
                    <button onClick={onStartNew}>+ New session</button>
                </div>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
            {!loading && sessions.length === 0 && <p style={{ color: '#666' }}>No sessions yet — start one to begin.</p>}

            {sessions.map((session) => (
                <div
                    key={session.id}
                    style={{
                        display: 'flex', flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 0',
                        borderBottom: '1px solid #eee',
                    }}
                >
                    <div>
                        <strong>{session.curriculumTopicName}</strong>{' '}
                        <span
                            style={{
                                fontSize: '0.75rem',
                                padding: '0.1rem 0.4rem',
                                borderRadius: 4,
                                background: session.status === 'ACTIVE' ? '#dcfce7' : '#e5e7eb',
                                color: session.status === 'ACTIVE' ? '#166534' : '#374151',
                            }}
                        >
              {session.status === 'ACTIVE' ? 'In progress' : 'Ended'}
            </span>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                            {formatDate(session.startedAt)} · {session.turnCount} turn{session.turnCount === 1 ? '' : 's'}
                        </div>
                    </div>
                    <button onClick={() => (session.status === 'ACTIVE' ? onResume(session.id) : onViewReport(session.id))}>
                        {session.status === 'ACTIVE' ? 'Resume' : 'View report'}
                    </button>
                </div>
            ))}
        </div>
    );
}