import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthContext';
import { ApiError } from '../api/client';
import { AuthLayout } from './AuthLayout';
import { LockIcon, StarIcon, UserIcon } from '../ui/icons';

export function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await register(name, email, password);
        } catch (err) {
            if (err instanceof ApiError && err.status === 422) {
                setError('That email is already registered.');
            } else if (err instanceof ApiError && err.status === 400) {
                setError('Please check your details. The password needs at least 8 characters.');
            } else {
                setError(err instanceof Error ? err.message : 'Registration failed.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout>
            <form onSubmit={handleSubmit}>
                <h2>Nice to meet you!</h2>
                <p className="auth-sub">Make an account to start teaching Lumi.</p>

                <div className="field">
                    <label htmlFor="reg-name">Name</label>
                    <div className="input-wrap">
                        <span className="input-icon" style={{ background: '#ffb84d' }}><UserIcon /></span>
                        <input id="reg-name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="reg-email">Email</label>
                    <div className="input-wrap">
                        <span className="input-icon" style={{ background: '#ff9aa2' }}><UserIcon /></span>
                        <input id="reg-email" type="email" placeholder="Type your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="reg-password">Password</label>
                    <div className="input-wrap">
                        <span className="input-icon" style={{ background: '#6fb4ff' }}><LockIcon /></span>
                        <input
                            id="reg-password"
                            type="password"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>
                </div>

                {error && <p className="form-error" role="alert">{error}</p>}

                <button type="submit" className="btn-big" disabled={submitting} aria-label="Register">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <StarIcon size={26} color="#ffe27a" />
              {submitting ? 'Creating...' : 'Create account'}
              <StarIcon size={26} color="#ffe27a" />
          </span>
                </button>

                <p style={{ textAlign: 'center', margin: '16px 0 0' }}>
                    Already have an account?{' '}
                    <button type="button" className="btn-link" aria-label="Log in" onClick={onSwitchToLogin}>Log in</button>
                </p>
            </form>
        </AuthLayout>
    );
}