import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthContext';
import { ApiError } from '../api/client';
import { AuthLayout } from './AuthLayout';
import { EyeIcon, LockIcon, StarIcon, UserIcon } from '../ui/icons';

export function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotNote, setShowForgotNote] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login(email, password);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                setError('Incorrect email or password.');
            } else {
                setError(err instanceof Error ? err.message : 'Login failed.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout>
            <form onSubmit={handleSubmit}>
                <h2>Welcome back!</h2>
                <p className="auth-sub">Ready to teach Lumi today?</p>

                <div className="field">
                    <label htmlFor="login-email">Email</label>
                    <div className="input-wrap">
                        <span className="input-icon" style={{ background: '#ff9aa2' }}><UserIcon /></span>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="Type your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="login-password">Password</label>
                    <div className="input-wrap">
                        <span className="input-icon" style={{ background: '#6fb4ff' }}><LockIcon /></span>
                        <input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Your secret password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="eye"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowPassword((v) => !v)}
                        >
                            <EyeIcon />
                        </button>
                    </div>
                </div>

                {error && <p className="form-error" role="alert">{error}</p>}

                <button type="submit" className="btn-big" disabled={submitting} aria-label="Log in">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <StarIcon size={26} color="#ffe27a" />
              {submitting ? 'Logging in...' : "Let's go!"}
              <StarIcon size={26} color="#ffe27a" />
          </span>
                </button>

                <p style={{ textAlign: 'center', margin: '14px 0' }}>
                    <button type="button" className="btn-link" onClick={() => setShowForgotNote((v) => !v)}>
                        Forgot my password
                    </button>
                </p>
                {showForgotNote && (
                    <p className="form-note">Ask an admin to reset it. They can give you a temporary password.</p>
                )}

                <button type="button" className="btn-green" aria-label="Register" onClick={onSwitchToRegister}>
                    New here? Make an account
                </button>
            </form>
        </AuthLayout>
    );
}