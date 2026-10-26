import type { SessionSummary } from '../api/types';

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function practiceDays(sessions: SessionSummary[]): Set<string> {
    return new Set(sessions.map((s) => dayKey(new Date(s.startedAt))));
}

/** Consecutive days with at least one session. Not having practised yet today does not break the streak. */
export function currentStreak(sessions: SessionSummary[], now = new Date()): number {
    const days = practiceDays(sessions);
    const cursor = new Date(now);
    if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let count = 0;
    while (days.has(dayKey(cursor))) {
        count++;
        cursor.setDate(cursor.getDate() - 1);
    }
    return count;
}

export function weekDays(sessions: SessionSummary[], now = new Date()) {
    const days = practiceDays(sessions);
    const mondayOffset = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);

    return ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return { label, done: days.has(dayKey(d)), today: dayKey(d) === dayKey(now) };
    });
}

export interface Badge {
    label: string;
    earned: boolean;
    color: string;
}

export function badges(sessions: SessionSummary[]): Badge[] {
    const finished = sessions.filter((s) => s.status === 'ENDED').length;
    const streak = currentStreak(sessions);
    return [
        { label: 'First session', earned: finished >= 1, color: '#ff7f6e' },
        { label: '3 sessions', earned: finished >= 3, color: '#6fb4ff' },
        { label: '3-day streak', earned: streak >= 3, color: '#ffc933' },
        { label: '10 sessions', earned: finished >= 10, color: '#5fd3a8' },
        { label: '5-day streak', earned: streak >= 5, color: '#9b7bff' },
        { label: '25 sessions', earned: finished >= 25, color: '#ff5f7e' },
    ];
}