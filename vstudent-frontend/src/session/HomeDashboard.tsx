import { useEffect, useState } from 'react';
import type { CurriculumTopic, ProgressResponse, SessionProgressPoint, SessionSummary } from '../api/types';
import { getCurriculumTopics, getProgress } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Lumi } from '../ui/Lumi';
import { MOODS, MOOD_ORDER } from '../ui/moods';
import { BookIcon, CheckIcon, GreaterIcon, LockIcon, PlayIcon, ShapesIcon, StarIcon } from '../ui/icons';
import { badges, currentStreak, weekDays } from './stats';

const GOALS: { label: string; pick: (p: SessionProgressPoint) => number | null }[] = [
    { label: 'Encourage Lumi', pick: (p) => p.encouragementRate },
    { label: 'Check understanding', pick: (p) => p.checksUnderstandingRate },
    { label: 'Ask open questions', pick: (p) => p.openQuestionRatio },
    { label: 'Handle mistakes', pick: (p) => p.mistakeHandlingRate },
];
const GOAL_THRESHOLD = 0.5;

const TOPIC_COLORS = [
    { bg: '#ffe3de', fg: '#ff7f6e' },
    { bg: '#dceeff', fg: '#4a9bff' },
    { bg: '#e4dcff', fg: '#8f6bff' },
    { bg: '#d9f6ea', fg: '#2eb88a' },
];
const TOPIC_ICONS = [
    (c: string) => <StarIcon size={30} color={c} />,
    (c: string) => <ShapesIcon color={c} />,
    (c: string) => <GreaterIcon color={c} />,
    (c: string) => <BookIcon size={28} color={c} />,
];

function Donut({ done, total }: { done: number; total: number }) {
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    return (
        <svg width="124" height="124" viewBox="0 0 124 124" role="img" aria-label={`${done} of ${total} goals met`}>
            <circle cx="62" cy="62" r={radius} fill="none" stroke="#ece6ff" strokeWidth="14" />
            <circle
                cx="62" cy="62" r={radius} fill="none" stroke="#5fd3a8" strokeWidth="14" strokeLinecap="round"
                strokeDasharray={`${(done / total) * circumference} ${circumference}`}
                transform="rotate(-90 62 62)"
            />
            <text x="62" y="64" textAnchor="middle" fontSize="26" fontWeight="900" fill="#2e9e78">{done}/{total}</text>
            <text x="62" y="82" textAnchor="middle" fontSize="12" fontWeight="800" fill="#8c84b8">met</text>
        </svg>
    );
}

interface HomeDashboardProps {
    sessions: SessionSummary[];
    onStartNew: () => void;
    onStartTopic: (topicId: number) => Promise<void>;
    onResume: (sessionId: number) => void;
    onViewReport: (sessionId: number) => void;
}

export function HomeDashboard({ sessions, onStartNew, onStartTopic, onResume, onViewReport }: HomeDashboardProps) {
    const { auth } = useAuth();
    const [topics, setTopics] = useState<CurriculumTopic[]>([]);
    const [progress, setProgress] = useState<ProgressResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!auth) return;
        getCurriculumTopics(auth.credentials)
            .then(setTopics)
            .catch((err) => setError(err instanceof Error ? err.message : 'Could not load topics.'));
        getProgress(auth.credentials)
            .then(setProgress)
            .catch(() => setProgress(null));
    }, [auth]);

    async function startTopic(topicId: number) {
        setError(null);
        try {
            await onStartTopic(topicId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not start session.');
        }
    }

    const activeSession = sessions.find((s) => s.status === 'ACTIVE');
    const lastPoint = progress && progress.sessions.length > 0 ? progress.sessions[progress.sessions.length - 1] : null;
    const goalStates = GOALS.map((g) => {
        const value = lastPoint ? g.pick(lastPoint) : null;
        return { label: g.label, met: value != null && value >= GOAL_THRESHOLD };
    });
    const goalsMet = goalStates.filter((g) => g.met).length;
    const firstName = auth?.teacherName.split(' ')[0] ?? 'there';
    const earned = badges(sessions);
    const week = weekDays(sessions);
    const streak = currentStreak(sessions);

    return (
        <div>
            {error && <p className="form-error" role="alert">{error}</p>}

            <div className="home-top">
                <section className="hero">
                    <div className="hero-art"><Lumi mood="confident" size={200} body /></div>
                    <div className="hero-text">
                        <small>Hi {firstName}! Lumi is waiting</small>
                        <h2>
                            {activeSession
                                ? `Ready to continue ${activeSession.curriculumTopicName}?`
                                : 'Ready to teach Lumi something new?'}
                        </h2>
                        {activeSession ? (
                            <button onClick={() => onResume(activeSession.id)}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><PlayIcon /> Resume session</span>
                            </button>
                        ) : (
                            <button onClick={onStartNew}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><PlayIcon /> Start a session</span>
                            </button>
                        )}
                    </div>
                </section>

                <section className="card">
                    <h3>Teaching goals</h3>
                    <div className="goals">
                        <Donut done={goalsMet} total={GOALS.length} />
                        <ul>
                            {goalStates.map((g) => (
                                <li key={g.label} className={g.met ? '' : 'off'}>
                                    <span className={g.met ? 'tick on' : 'tick'}>{g.met && <CheckIcon size={14} />}</span>
                                    {g.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p style={{ margin: '10px 0 0', color: 'var(--muted)', fontSize: '0.8rem' }}>
                        {lastPoint ? 'Last session. A goal is met at 50% or more.' : 'Finish a session to see your goals.'}
                    </p>
                </section>
            </div>

            <div className="section-head"><h2>Topics to teach</h2><span>Pick one to start a session right away</span></div>
            {topics.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No topics yet. An admin can add them under Curriculum.</p>
            ) : (
                <div className="topics">
                    {topics.map((topic, i) => {
                        const color = TOPIC_COLORS[i % TOPIC_COLORS.length];
                        const count = sessions.filter((s) => s.curriculumTopicName === topic.name).length;
                        return (
                            <article className="card topic" key={topic.id}>
                                <div className="topic-head">
                  <span className="topic-icon" style={{ background: color.bg }}>
                    {TOPIC_ICONS[i % TOPIC_ICONS.length](color.fg)}
                  </span>
                                    <div>
                                        <strong>{topic.name}</strong>
                                        <span>Level {topic.difficultyLevel}</span>
                                    </div>
                                </div>
                                <div className="pips" aria-hidden="true">
                                    {Array.from({ length: Math.min(topic.difficultyLevel, 5) }, (_, n) => (
                                        <span key={n} className="pip" style={{ background: color.fg }} />
                                    ))}
                                </div>
                                <div className="topic-foot" style={{ color: color.fg }}>
                                    <span>{count} session{count === 1 ? '' : 's'}</span>
                                    <button
                                        className="play"
                                        aria-label={`Start ${topic.name}`}
                                        style={{ background: color.fg }}
                                        onClick={() => startTopic(topic.id)}
                                    >
                                        <PlayIcon />
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            <div className="section-head"><h2>Your sessions</h2></div>
            <section className="card">
                {sessions.length === 0 && <p style={{ color: 'var(--muted)', margin: 0 }}>No sessions yet. Start one to begin.</p>}
                {sessions.map((s) => (
                    <div className="row" key={s.id}>
                        <div>
                            <strong>{s.curriculumTopicName}</strong>{' '}
                            <span className={s.status === 'ACTIVE' ? 'tag live' : 'tag done'}>
                {s.status === 'ACTIVE' ? 'In progress' : 'Ended'}
              </span>
                            <small>{new Date(s.startedAt).toLocaleString()}, {s.turnCount} turn{s.turnCount === 1 ? '' : 's'}</small>
                        </div>
                        <button onClick={() => (s.status === 'ACTIVE' ? onResume(s.id) : onViewReport(s.id))}>
                            {s.status === 'ACTIVE' ? 'Resume' : 'View report'}
                        </button>
                    </div>
                ))}
            </section>

            <div className="section-head"><h2>How Lumi feels</h2><span>Lumi shows feelings while you teach</span></div>
            <div className="feelings">
                {MOOD_ORDER.map((mood) => (
                    <div className="mood-card" key={mood} style={{ background: MOODS[mood].bg }}>
                        <Lumi mood={mood} size={92} />
                        <span className="pill" style={{ color: MOODS[mood].fg }}>{MOODS[mood].label}</span>
                    </div>
                ))}
            </div>

            <div className="two-col">
                <section className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h3 style={{ margin: 0 }}>My badges</h3>
                        <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              {earned.filter((b) => b.earned).length} of {earned.length} collected
            </span>
                    </div>
                    <div className="stickers">
                        {earned.map((b) => (
                            <div
                                key={b.label}
                                className={b.earned ? 'sticker' : 'sticker locked'}
                                style={{ background: b.color }}
                                title={b.label}
                                role="img"
                                aria-label={`${b.label}${b.earned ? '' : ' (locked)'}`}
                            >
                                {b.earned ? <StarIcon size={30} color="#fff" /> : <LockIcon size={24} color="#b9b3d1" />}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="card">
                    <h3 style={{ margin: 0 }}>Weekly streak</h3>
                    <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
                        {streak} day{streak === 1 ? '' : 's'} in a row
                    </p>
                    <div className="week">
                        {week.map((d, i) => (
                            <div key={i} className={d.today ? 'today' : ''}>
                                <span className={d.done ? 'tick on' : 'tick'}>{d.done && <CheckIcon size={18} />}</span>
                                {d.label}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}