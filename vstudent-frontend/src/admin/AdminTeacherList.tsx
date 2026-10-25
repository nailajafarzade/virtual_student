import { useEffect, useState } from 'react';
import type { AdminTeacherSummary } from '../api/types';
import { changeTeacherRole, listTeachersAdmin, resetTeacherPassword } from '../api/client';
import { useAuth } from '../auth/AuthContext';

function formatDate(iso: string | null): string {
    return iso ? new Date(iso).toLocaleDateString() : 'Never';
}

interface AdminTeacherListProps {
    onBack: () => void;
    onViewTeacherProgress: (teacherId: number, teacherName: string) => void;
}

export function AdminTeacherList({ onBack, onViewTeacherProgress }: AdminTeacherListProps) {
    const { auth } = useAuth();
    const [teachers, setTeachers] = useState<AdminTeacherSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resetResult, setResetResult] = useState<{ teacherName: string; temporaryPassword: string } | null>(null);

    useEffect(() => {
        if (!auth) return;
        listTeachersAdmin(auth.credentials)
            .then(setTeachers)
            .catch((err) => setError(err instanceof Error ? err.message : 'Could not load teachers.'))
            .finally(() => setLoading(false));
    }, [auth]);

    async function handleChangeRole(teacherId: number, teacherName: string, newRole: 'TEACHER' | 'ADMIN') {
        if (!auth) return;
        const actionLabel = newRole === 'ADMIN' ? 'Promote' : 'Demote';
        const targetLabel = newRole === 'ADMIN' ? 'to admin' : 'to a regular teacher';
        if (!confirm(`${actionLabel} ${teacherName} ${targetLabel}?`)) return;

        setError(null);
        try {
            const updated = await changeTeacherRole(auth.credentials, teacherId, newRole);
            setTeachers((prev) => prev.map((t) => (t.id === teacherId ? updated : t)));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not change role.');
        }
    }

    async function handleResetPassword(teacherId: number, teacherName: string) {
        if (!auth) return;
        if (!confirm(`Reset ${teacherName}'s password? Their current password will stop working immediately.`)) return;

        setError(null);
        try {
            const { temporaryPassword } = await resetTeacherPassword(auth.credentials, teacherId);
            setResetResult({ teacherName, temporaryPassword });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not reset password.');
        }
    }

    return (
        <div>
            <button onClick={onBack} style={{ marginBottom: '1rem' }}>
                ← Back to sessions
            </button>
            <h2>All teachers</h2>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'crimson' }}>{error}</p>}

            {resetResult && (
                <div style={{ border: '1px solid #fbbf24', background: '#fffbeb', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem' }}>
                    <strong>{resetResult.teacherName}'s new temporary password:</strong>{' '}
                    <code style={{ background: '#fff', padding: '0.15rem 0.4rem', borderRadius: 4 }}>
                        {resetResult.temporaryPassword}
                    </code>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                        Share this with them now — it won't be shown again. They should change it after logging in.
                    </div>
                    <button onClick={() => setResetResult(null)} style={{ marginTop: '0.5rem' }}>
                        Dismiss
                    </button>
                </div>
            )}

            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.9rem' }}>
                <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '0.4rem' }}>Name</th>
                    <th style={{ padding: '0.4rem' }}>Role</th>
                    <th style={{ padding: '0.4rem' }}>Sessions</th>
                    <th style={{ padding: '0.4rem' }}>Completed</th>
                    <th style={{ padding: '0.4rem' }}>Last active</th>
                    <th style={{ padding: '0.4rem' }}></th>
                </tr>
                </thead>
                <tbody>
                {teachers.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '0.4rem' }}>
                            {t.name}
                            <div style={{ fontSize: '0.75rem', color: '#999' }}>{t.email}</div>
                        </td>
                        <td style={{ padding: '0.4rem' }}>{t.role}</td>
                        <td style={{ padding: '0.4rem' }}>{t.totalSessions}</td>
                        <td style={{ padding: '0.4rem' }}>{t.completedSessions}</td>
                        <td style={{ padding: '0.4rem' }}>{formatDate(t.lastSessionAt)}</td>
                        <td style={{ padding: '0.4rem', whiteSpace: 'nowrap' }}>
                            <button onClick={() => onViewTeacherProgress(t.id, t.name)} disabled={t.completedSessions === 0}>
                                View progress
                            </button>
                            <button
                                onClick={() => handleChangeRole(t.id, t.name, t.role === 'ADMIN' ? 'TEACHER' : 'ADMIN')}
                                style={{ marginLeft: '0.5rem' }}
                            >
                                {t.role === 'ADMIN' ? 'Demote' : 'Promote'}
                            </button>
                            <button onClick={() => handleResetPassword(t.id, t.name)} style={{ marginLeft: '0.5rem' }}>
                                Reset password
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}