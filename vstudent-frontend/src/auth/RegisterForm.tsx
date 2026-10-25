import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthContext';
import { ApiError } from '../api/client';

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
                setError('Please check your details — password needs at least 8 characters.');
            } else {
                setError(err instanceof Error ? err.message : 'Registration failed.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 320 }}>
            <h2>Register</h2>
            <label>
                Name
                <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
                Password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </label>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
            <button type="submit" disabled={submitting}>
                {submitting ? 'Registering...' : 'Register'}
            </button>
            <p>
                Already registered? <button type="button" onClick={onSwitchToLogin}>Log in</button>
            </p>
        </form>
    );
}