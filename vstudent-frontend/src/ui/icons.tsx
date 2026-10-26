import type { ReactNode } from 'react';

interface IconProps {
    size?: number;
    color?: string;
}

function svg(size: number, children: ReactNode) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            {children}
        </svg>
    );
}

export const StarIcon = ({ size = 24, color = 'currentColor' }: IconProps) =>
    svg(size, <path fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round" d="M12 2l3 6.5 7 .9-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.9z" />);

export const UserIcon = ({ size = 20, color = '#fff' }: IconProps) =>
    svg(size, <><circle cx="12" cy="8" r="4" fill={color} /><path fill={color} d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" /></>);

export const LockIcon = ({ size = 20, color = '#fff' }: IconProps) =>
    svg(size, <><rect x="5" y="11" width="14" height="10" rx="3" fill={color} /><path d="M8 11V8a4 4 0 018 0v3" stroke={color} strokeWidth="2.5" fill="none" /></>);

export const EyeIcon = ({ size = 24, color = 'currentColor' }: IconProps) =>
    svg(size, <><ellipse cx="12" cy="12" rx="9" ry="6" fill="none" stroke={color} strokeWidth="2" /><circle cx="12" cy="12" r="2.6" fill={color} /></>);

export const FlameIcon = ({ size = 22, color = '#ff9a3c' }: IconProps) =>
    svg(size, <path fill={color} d="M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-5 3-7 .5 2 1 2.5 2 2 0-3-.5-5 1-7z" />);

export const CheckIcon = ({ size = 16, color = '#fff' }: IconProps) =>
    svg(size, <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />);

export const PlayIcon = ({ size = 18, color = '#fff' }: IconProps) =>
    svg(size, <path fill={color} d="M8 5v14l11-7z" />);

export const HomeIcon = ({ size = 20, color = '#fff' }: IconProps) =>
    svg(size, <path fill={color} d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />);

export const ChartIcon = ({ size = 20, color = '#fff' }: IconProps) =>
    svg(size, <><rect x="4" y="12" width="4" height="8" rx="1.5" fill={color} /><rect x="10" y="6" width="4" height="14" rx="1.5" fill={color} /><rect x="16" y="9" width="4" height="11" rx="1.5" fill={color} /></>);

export const BookIcon = ({ size = 20, color = '#fff' }: IconProps) =>
    svg(size, <path fill={color} d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z" />);

export const UsersIcon = ({ size = 20, color = '#fff' }: IconProps) =>
    svg(size, <><circle cx="9" cy="8" r="3.5" fill={color} /><path fill={color} d="M2 20c0-4 3-6 7-6s7 2 7 6z" /><circle cx="17" cy="9" r="2.8" fill={color} opacity=".8" /><path fill={color} opacity=".8" d="M17 14c3 0 5 1.8 5 5h-4.5c0-2-.5-3.6-1.5-5z" /></>);

export const ShapesIcon = ({ size = 28, color = 'currentColor' }: IconProps) =>
    svg(size, <><circle cx="8" cy="8" r="5" fill={color} /><rect x="12" y="11" width="9" height="9" rx="2" fill={color} opacity=".7" /><path fill={color} d="M6 21l-4-7h8z" opacity=".85" /></>);

export const GreaterIcon = ({ size = 28, color = 'currentColor' }: IconProps) =>
    svg(size, <path d="M8 5l9 7-9 7" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />);