import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
    changeSessionTopic,
    endSession,
    getSession,
    getSessionReport,
    getTurns,
    listSessions,
    startSession,
    submitAudioTurn,
    submitTextTurn,
} from '../api/client';
import type { SessionReport, SessionResponse, SessionSummary, Turn } from '../api/types';
import { HomeDashboard } from './HomeDashboard';
import { TopicPicker } from './TopicPicker';
import { TurnInput } from './TurnInput';
import { TurnHistory } from './TurnHistory';
import { ChildStateDisplay } from './ChildStateDisplay';
import { SessionReportView } from './SessionReportView';
import { ProgressView } from './ProgressView';
import { LessonGuidanceBanner } from './LessonGuidanceBanner';
import { CurriculumManager } from '../curriculum/CurriculumManager';
import { AdminTeacherList } from '../admin/AdminTeacherList';
import { ChangePasswordForm } from '../auth/ChangePasswordForm';
import { Lumi } from '../ui/Lumi';
import { BookIcon, ChartIcon, FlameIcon, HomeIcon, StarIcon, UsersIcon } from '../ui/icons';
import { currentStreak } from './stats';

type WorkspaceState =
    | { phase: 'listing' }
    | { phase: 'picking' }
    | { phase: 'active'; session: SessionResponse; turns: Turn[] }
    | { phase: 'ended'; report: SessionReport }
    | { phase: 'progress'; teacherId?: number; teacherName?: string }
    | { phase: 'curriculum' }
    | { phase: 'admin-teachers' }
    | { phase: 'password' };

function greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

export function SessionWorkspace() {
    const { auth, logout } = useAuth();
    const [state, setState] = useState<WorkspaceState>({ phase: 'listing' });
    const [error, setError] = useState<string | null>(null);
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [menuOpen, setMenuOpen] = useState(false);

    const loadSessions = useCallback(() => {
        if (!auth) return;
        listSessions(auth.credentials)
            .then(setSessions)
            .catch((err) => setError(err instanceof Error ? err.message : 'Could not load sessions.'));
    }, [auth]);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    if (!auth) return null;
    const credentials = auth.credentials;
    const isAdmin = auth.role === 'ADMIN';

    function goToListing() {
        setError(null);
        setMenuOpen(false);
        setState({ phase: 'listing' });
        loadSessions();
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
        const sessionId = state.session.id;
        const turn = await submitTextTurn(credentials, sessionId, text);
        setState((prev) => (prev.phase === 'active' && prev.session.id === sessionId ? { ...prev, turns: [...prev.turns, turn] } : prev));
    }

    async function handleSubmitAudio(blob: Blob) {
        if (state.phase !== 'active') return;
        setError(null);
        const sessionId = state.session.id;
        const turn = await submitAudioTurn(credentials, sessionId, blob);
        setState((prev) => (prev.phase === 'active' && prev.session.id === sessionId ? { ...prev, turns: [...prev.turns, turn] } : prev));
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

    const isHome = ['listing', 'picking', 'active', 'ended'].includes(state.phase);
    const navItems = [
        { key: 'home', label: 'Home', color: '#ff7f6e', icon: <HomeIcon />, active: isHome, go: goToListing, show: true },
        { key: 'progress', label: 'Progress', color: '#6fb4ff', icon: <ChartIcon />, active: state.phase === 'progress' && state.teacherId == null, go: () => setState({ phase: 'progress' }), show: true },
        { key: 'curriculum', label: 'Curriculum', color: '#ffc933', icon: <BookIcon />, active: state.phase === 'curriculum', go: () => setState({ phase: 'curriculum' }), show: isAdmin },
        { key: 'teachers', label: 'Teachers', color: '#9b7bff', icon: <UsersIcon />, active: state.phase === 'admin-teachers' || (state.phase === 'progress' && state.teacherId != null), go: () => setState({ phase: 'admin-teachers' }), show: isAdmin },
    ].filter((item) => item.show);

    const streak = currentStreak(sessions);
    const finished = sessions.filter((s) => s.status === 'ENDED').length;

    function renderShell(content: ReactNode) {
        return (
            <div className="shell">
                <nav className="sidebar" aria-label="Main">
                    <div className="side-brand">
                        <span className="brand-mark"><StarIcon size={24} color="#fff" /></span>
                        Lumi Learn
                    </div>
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            className={item.active ? 'nav-item active' : 'nav-item'}
                            aria-current={item.active ? 'page' : undefined}
                            onClick={item.go}
                        >
                            <span className="nav-dot" style={{ background: item.color }}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                    <div className="mascot-card">
                        <Lumi mood="confident" size={96} />
                        <div className="pill">Lumi is ready!</div>
                    </div>
                </nav>

                <main className="main">
                    <header className="topbar">
                        <div>
                            {state.phase === 'listing' && (
                                <>
                                    <h1>{greeting()}, {auth?.teacherName.split(' ')[0]}!</h1>
                                    <p>Let us teach and learn today</p>
                                </>
                            )}
                        </div>
                        <div className="top-right">
                            <span className="chip"><FlameIcon /> {streak} day{streak === 1 ? '' : 's'}</span>
                            <span className="chip" style={{ background: '#fff6c9' }}><StarIcon size={20} color="#ffc933" /> {finished} done</span>
                            <button className="avatar-btn" aria-label="Account menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
                                {auth?.teacherName.charAt(0).toUpperCase()}
                            </button>
                            {menuOpen && (
                                <div className="menu">
                                    <button type="button" onClick={() => { setMenuOpen(false); setState({ phase: 'password' }); }}>Change password</button>
                                    <button type="button" onClick={logout}>Log out</button>
                                </div>
                            )}
                        </div>
                    </header>
                    {content}
                </main>
            </div>
        );
    }

    if (state.phase === 'listing') {
        return renderShell(
            <>
                {error && <p className="form-error" role="alert">{error}</p>}
                <HomeDashboard
                    sessions={sessions}
                    onStartNew={() => setState({ phase: 'picking' })}
                    onStartTopic={handleStart}
                    onResume={handleResume}
                    onViewReport={handleViewReport}
                />
            </>,
        );
    }

    if (state.phase === 'progress') {
        return renderShell(
            <div className="panel">
                <ProgressView
                    onBack={state.teacherId != null ? () => setState({ phase: 'admin-teachers' }) : goToListing}
                    teacherId={state.teacherId}
                    teacherName={state.teacherName}
                />
            </div>,
        );
    }

    if (state.phase === 'curriculum') {
        return renderShell(<div className="panel"><CurriculumManager onBack={goToListing} /></div>);
    }

    if (state.phase === 'admin-teachers') {
        return renderShell(
            <div className="panel">
                <AdminTeacherList
                    onBack={goToListing}
                    onViewTeacherProgress={(teacherId, teacherName) => setState({ phase: 'progress', teacherId, teacherName })}
                />
            </div>,
        );
    }

    if (state.phase === 'password') {
        return renderShell(<div className="panel"><ChangePasswordForm onClose={goToListing} /></div>);
    }

    if (state.phase === 'picking') {
        return renderShell(
            <div className="panel">
                <button type="button" onClick={goToListing} style={{ marginBottom: '1rem' }}>Back to sessions</button>
                <TopicPicker onStart={handleStart} />
            </div>,
        );
    }

    if (state.phase === 'ended') {
        return renderShell(<div className="panel"><SessionReportView report={state.report} onBack={goToListing} /></div>);
    }

    const latestTurn = state.turns.length > 0 ? state.turns[state.turns.length - 1] : null;
    const latestState = latestTurn?.childState ?? null;
    const latestGuidance = latestTurn?.lessonGuidance ?? null;

    return renderShell(
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: 16, flexWrap: 'wrap' }}>
                <div>
                    <button type="button" onClick={goToListing} style={{ marginRight: 12 }}>Back to sessions</button>
                    <h2 style={{ margin: 0, display: 'inline-block', verticalAlign: 'middle' }}>{state.session.curriculumTopicName}</h2>
                </div>
                <button onClick={handleEndSession}>End session</button>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="session-grid">
                <ChildStateDisplay state={latestState} />
                <section className="panel">
                    {latestGuidance && <LessonGuidanceBanner guidance={latestGuidance} onSwitchTopic={handleSwitchTopic} />}
                    <TurnHistory turns={state.turns} credentials={credentials} />
                    <TurnInput onSubmitText={handleSubmitText} onSubmitAudio={handleSubmitAudio} />
                </section>
            </div>
        </>,
    );
}
