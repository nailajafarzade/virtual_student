export type Mood = 'neutral' | 'confident' | 'curious' | 'shy' | 'frustrated' | 'tired';

export const MOOD_ORDER: Mood[] = ['neutral', 'confident', 'curious', 'shy', 'frustrated', 'tired'];

export const MOODS: Record<Mood, { label: string; bg: string; fg: string }> = {
    neutral: { label: 'Calm', bg: '#dceeff', fg: '#2f6fd0' },
    confident: { label: 'Proud', bg: '#d9f6ea', fg: '#238a66' },
    curious: { label: 'Curious', bg: '#e9e2ff', fg: '#6b4fd8' },
    shy: { label: 'Shy', bg: '#ffe3ea', fg: '#c73d68' },
    frustrated: { label: 'Frustrated', bg: '#ffe0d6', fg: '#c9402a' },
    tired: { label: 'Tired', bg: '#eceaf7', fg: '#6b64a0' },
};

/** Backend "CONFIDENT" / "confident" -> Mood. Unknown values fall back to neutral. */
export function normalizeMood(value?: string | null): Mood {
    const key = (value ?? '').toLowerCase();
    return (key in MOODS ? key : 'neutral') as Mood;
}