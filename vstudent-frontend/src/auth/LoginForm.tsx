import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthContext';
import { ApiError } from '../api/client';

export function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        <form onSubmit={handleSubmit} style={{ maxWidth: 320 }}>
            <h2>Log in</h2>
            <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
                Password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
            <button type="submit" disabled={submitting}>
                {submitting ? 'Logging in...' : 'Log in'}
            </button>
            <p>
                No account? <button type="button" onClick={onSwitchToRegister}>Register</button>
            </p>
        </form>
    );
}