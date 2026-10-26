import { MOODS, type Mood } from './moods';

const INK = '#4a2e2a';
const MOUTH = '#8e2f3a';

function Features({ mood }: { mood: Mood }) {
    const dots = (cy: number, r = 5.5) => (
        <>
            <circle cx="-22" cy={cy} r={r} fill={INK} />
            <circle cx="22" cy={cy} r={r} fill={INK} />
        </>
    );
    const stroke = { stroke: INK, strokeWidth: 4, fill: 'none', strokeLinecap: 'round' as const };

    switch (mood) {
        case 'confident':
            return (
                <>
                    <path d="M-31,0 Q-22,-15 -13,0" {...stroke} />
                    <path d="M13,0 Q22,-15 31,0" {...stroke} />
                    <path d="M-18,19 Q0,52 18,19 Z" fill={MOUTH} />
                    <ellipse cx="0" cy="35" rx="8" ry="5" fill="#ff8fa0" />
                </>
            );
        case 'curious':
            return (
                <>
                    {dots(0, 6.5)}
                    <path d="M-32,-14 Q-22,-22 -12,-14" {...stroke} strokeWidth={3} />
                    <ellipse cx="0" cy="30" rx="6" ry="8" fill={MOUTH} />
                </>
            );
        case 'shy':
            return (
                <>
                    {dots(6)}
                    <path d="M-12,30 Q-6,25 0,30 T12,30" {...stroke} strokeWidth={3} />
                </>
            );
        case 'frustrated':
            return (
                <>
                    {dots(2)}
                    <path d="M-34,-14 L-12,-6" {...stroke} strokeWidth={4} />
                    <path d="M34,-14 L12,-6" {...stroke} strokeWidth={4} />
                    <path d="M-14,34 Q0,22 14,34" {...stroke} strokeWidth={3.5} />
                </>
            );
        case 'tired':
            return (
                <>
                    <path d="M-31,2 Q-22,9 -13,2" {...stroke} />
                    <path d="M13,2 Q22,9 31,2" {...stroke} />
                    <path d="M-8,30 Q0,35 8,30" {...stroke} strokeWidth={3} />
                    <text x="48" y="-34" fontSize="22" fontWeight="900" fill="#8f7bd8">z</text>
                    <text x="60" y="-50" fontSize="16" fontWeight="900" fill="#8f7bd8">z</text>
                </>
            );
        default:
            return (
                <>
                    {dots(0)}
                    <path d="M-12,26 Q0,36 12,26" {...stroke} strokeWidth={3.5} />
                </>
            );
    }
}

interface LumiProps {
    mood?: Mood;
    size?: number;
    /** Show shoulders and shirt under the head. */
    body?: boolean;
    /** Accessible label; leave empty when the character is decorative. */
    label?: string;
}

export function Lumi({ mood = 'confident', size = 120, body = false, label }: LumiProps) {
    const viewBox = body ? '-95 -98 190 215' : '-80 -98 160 162';
    const height = body ? (size * 215) / 190 : (size * 162) / 160;

    return (
        <svg
            width={size}
            height={height}
            viewBox={viewBox}
            role={label ? 'img' : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
        >
            {body && (
                <g>
                    <rect x="-11" y="48" width="22" height="20" fill="#ffd7b5" />
                    <path d="M-46,215 Q-52,70 -26,58 L26,58 Q52,70 46,215 Z" fill="#ff7f6e" />
                    <path d="M-15,58 L0,76 L15,58 Z" fill="#fff" />
                    <path transform="translate(0,96) scale(0.55)" d="M0,-12 L3.5,-4 L12,-3 L5.5,3 L7.5,12 L0,7.5 L-7.5,12 L-5.5,3 L-12,-3 L-3.5,-4 Z" fill="#ffd23f" stroke="#ffd23f" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M-38,76 L-54,112" stroke="#ff7f6e" strokeWidth="17" strokeLinecap="round" />
                    <circle cx="-54" cy="112" r="9.5" fill="#ffd7b5" />
                    <path d="M38,76 L54,112" stroke="#ff7f6e" strokeWidth="17" strokeLinecap="round" />
                    <circle cx="54" cy="112" r="9.5" fill="#ffd7b5" />
                </g>
            )}
            <circle cx="-62" cy="6" r="10" fill="#ffd7b5" />
            <circle cx="62" cy="6" r="10" fill="#ffd7b5" />
            <circle r="62" fill="#ffd7b5" />
            <path d="M-61,-6 Q-66,-64 0,-68 Q66,-64 61,-6 Q42,-40 0,-37 Q-42,-40 -61,-6Z" fill="#6b4331" />
            <path d="M-4,-66 Q-6,-90 16,-82 Q6,-78 10,-64Z" fill="#6b4331" />
            <ellipse cx="-40" cy="16" rx="9" ry="6" fill="#ff9aa2" opacity={mood === 'shy' ? 0.95 : 0.55} />
            <ellipse cx="40" cy="16" rx="9" ry="6" fill="#ff9aa2" opacity={mood === 'shy' ? 0.95 : 0.55} />
            {mood !== 'confident' && mood !== 'curious' && <ellipse cx="0" cy="10" rx="3" ry="2" fill="#f2a98c" />}
            <Features mood={mood} />
            {mood === 'curious' && <text x="52" y="-36" fontSize="30" fontWeight="900" fill="#8f6bff">?</text>}
            {body === false && <title>{label ?? MOODS[mood].label}</title>}
        </svg>
    );
}