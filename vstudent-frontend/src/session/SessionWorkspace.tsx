import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
    changeSessionTopic,
    endSession,
    getSession,
    getSessionReport,
    getTurns,
    startSession,
    submitAudioTurn,
    submitTextTurn,
} from '../api/client';
import type { SessionReport, SessionResponse, Turn } from '../api/types';
import { SessionList } from './SessionList';
import { TopicPicker } from './TopicPicker';
import { TurnInput } from './TurnInput';
import { TurnHistory } from './TurnHistory';
import { ChildStateDisplay } from './ChildStateDisplay';
import { SessionReportView } from './SessionReportView';
import { ProgressView } from './ProgressView';
import { LessonGuidanceBanner } from './LessonGuidanceBanner';
import { CurriculumManager } from '../curriculum/CurriculumManager';
import { AdminTeacherList } from '../admin/AdminTeacherList';

type WorkspaceState =
    | { phase: 'listing' }
    | { phase: 'picking' }
    | { phase: 'active'; session: SessionResponse; turns: Turn[] }
    | { phase: 'ended'; report: SessionReport }
    | { phase: 'progress'; teacherId?: number; teacherName?: string }
    | { phase: 'curriculum' }
    | { phase: 'admin-teachers' };

export function SessionWorkspace() {
    const { auth } = useAuth();
    const [state, setState] = useState<WorkspaceState>({ phase: 'listing' });
    const [error, setError] = useState<string | null>(null);

    if (!auth) return null;
    const credentials = auth.credentials;

    function goToListing() {
        setError(null);
        setState({ phase: 'listing' });
    }

    async function handleStart(topicId: number) {
        const session = await startSession(credentials, topicId);
        setState({ phase: 'active', session, turns: [] });
    }

    async function handleResume(sessionId: number) {
        setError(null);
        try {
            const [session, turns] = await Promise.all([
                getSession(credentials, sessionId),
                getTurns(credentials, sessionId),
            ]);
            setState({ phase: 'active', session, turns });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not resume session.');
        }
    }

    async function handleViewReport(sessionId: number) {
        setError(null);
        try {
            const report = await getSessionReport(credentials, sessionId);
            setState({ phase: 'ended', report });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load report.');
        }
    }

    async function handleSubmitText(text: string) {
        if (state.phase !== 'active') return;
        setError(null);
        try {
            const turn = await submitTextTurn(credentials, state.session.id, text);
            setState((prev) => (prev.phase === 'active' ? { ...prev, turns: [...prev.turns, turn] } : prev));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not submit turn.');
        }
    }

    async function handleSubmitAudio(blob: Blob) {
        if (state.phase !== 'active') return;
        setError(null);
        try {
            const turn = await submitAudioTurn(credentials, state.session.id, blob);
            setState((prev) => (prev.phase === 'active' ? { ...prev, turns: [...prev.turns, turn] } : prev));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not submit audio turn.');
        }
    }

    async function handleSwitchTopic(topicId: number) {
        if (state.phase !== 'active') return;
        setError(null);
        try {
            const updatedSession = await changeSessionTopic(credentials, state.session.id, topicId);
            setState((prev) => (prev.phase === 'active' ? { ...prev, session: updatedSession } : prev));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not switch topic.');
        }
    }

    async function handleEndSession() {
        if (state.phase !== 'active') return;
        setError(null);
        try {
            await endSession(credentials, state.session.id);
            const report = await getSessionReport(credentials, state.session.id);
            setState({ phase: 'ended', report });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not end session.');
        }
    }

    if (state.phase === 'listing') {
        return (
            <div>
                {error && <p style={{ color: 'crimson' }}>{error}</p>}
                <SessionList
                    onStartNew={() => setState({ phase: 'picking' })}
                    onResume={handleResume}
                    onViewReport={handleViewReport}
                    onViewProgress={() => setState({ phase: 'progress' })}
                    onManageCurriculum={() => setState({ phase: 'curriculum' })}
                    onViewAllTeachers={() => setState({ phase: 'admin-teachers' })}
                />
            </div>
        );
    }

    if (state.phase === 'progress') {
        return <ProgressView onBack={goToListing} teacherId={state.teacherId} teacherName={state.teacherName} />;
    }

    if (state.phase === 'curriculum') {
        return <CurriculumManager onBack={goToListing} />;
    }

    if (state.phase === 'admin-teachers') {
        return (
            <AdminTeacherList
                onBack={goToListing}
                onViewTeacherProgress={(teacherId, teacherName) => setState({ phase: 'progress', teacherId, teacherName })}
            />
        );
    }

    if (state.phase === 'picking') {
        return (
            <div>
                <button onClick={goToListing} style={{ marginBottom: '1rem' }}>
                    ← Back to sessions
                </button>
                <TopicPicker onStart={handleStart} />
            </div>
        );
    }

    if (state.phase === 'ended') {
        return <SessionReportView report={state.report} onBack={goToListing} />;
    }

    const latestTurn = state.turns.length > 0 ? state.turns[state.turns.length - 1] : null;
    const latestState = latestTurn?.childState ?? null;
    const latestGuidance = latestTurn?.lessonGuidance ?? null;

    return (
        <div>
            <button onClick={goToListing} style={{ marginBottom: '0.5rem' }}>
                ← Back to sessions
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>{state.session.curriculumTopicName}</h2>
                <button onClick={handleEndSession}>End session</button>
            </div>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
            <div style={{ margin: '1rem 0' }}>
                <ChildStateDisplay state={latestState} />
            </div>
            {latestGuidance && <LessonGuidanceBanner guidance={latestGuidance} onSwitchTopic={handleSwitchTopic} />}
            <TurnHistory turns={state.turns} credentials={credentials} />
            <TurnInput onSubmitText={handleSubmitText} onSubmitAudio={handleSubmitAudio} />
        </div>
    );
}