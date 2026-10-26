import type { ReactNode } from 'react';
import { Lumi } from '../ui/Lumi';
import { StarIcon } from '../ui/icons';

export function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="login-page">
            <div className="sun" />
            <div className="cloud" style={{ top: 120, left: 60 }} />
            <div className="cloud" style={{ top: 60, left: '38%', transform: 'scale(.8)' }} />
            <div className="hill b" />
            <div className="hill a" />

            <div className="brand">
                <span className="brand-mark"><StarIcon size={30} color="#fff" /></span>
                Lumi Learn
            </div>

            <div className="login-art" aria-hidden="true">
                <div className="bubble-hi">
                    <strong>Hi, teacher!</strong>
                    <span>Come and teach me</span>
                </div>
                <div className="block" style={{ left: '4%', top: 210, background: '#ff8a7a', transform: 'rotate(-12deg)' }}>A</div>
                <div className="block" style={{ left: '12%', top: 320, background: '#5fd3a8', transform: 'rotate(10deg)' }}>B</div>
                <div className="block" style={{ left: '2%', top: 420, background: '#ffd23f', transform: 'rotate(-6deg)' }}>1</div>
                <Lumi mood="confident" size={340} body />
            </div>

            <div className="auth-card">
                <div className="auth-avatar" aria-hidden="true">
                    <div style={{ marginTop: 10, marginLeft: -2 }}>
                        <Lumi mood="confident" size={92} />
                    </div>
                </div>
                {children}
                <p className="auth-foot">Safe and private. Practice teaching with a virtual student.</p>
            </div>
        </div>
    );
}