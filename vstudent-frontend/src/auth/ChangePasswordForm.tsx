import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthContext';
import { ApiError, changeOwnPassword } from '../api/client';

export function ChangePasswordForm({ onClose }: { onClose: () => void }) {
    const { auth, updateStoredPassword } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!auth) return;
        setError(null);
        setSubmitting(true);
        try {
            await changeOwnPassword(auth.credentials, currentPassword, newPassword);
            updateStoredPassword(newPassword);
            setSuccess(true);
        } catch (err) {
            if (err instanceof ApiError && err.status === 422) {
                setError(err.message);
            } else {
                setError(err instanceof Error ? err.message : 'Could not change password.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    if (success) {
        return (
            <div style={{ maxWidth: 320 }}>
                <p style={{ color: 'green' }}>Password changed.</p>
                <button onClick={onClose}>Close</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 320 }}>
            <h3>Change password</h3>
            <label>
                Current password
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </label>
            <label>
                New password
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                />
            </label>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Change password'}
                </button>
                <button type="button" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </form>
    );
}