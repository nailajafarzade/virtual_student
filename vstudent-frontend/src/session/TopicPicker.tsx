import { useEffect, useState } from 'react';
import type { CurriculumTopic } from '../api/types';
import { getCurriculumTopics } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function TopicPicker({ onStart }: { onStart: (topicId: number) => Promise<void> }) {
    const { auth } = useAuth();
    const [topics, setTopics] = useState<CurriculumTopic[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!auth) return;
        getCurriculumTopics(auth.credentials)
            .then((fetched) => {
                setTopics(fetched);
                setSelectedId(fetched[0]?.id ?? null);
            })
            .catch((err) => setError(err instanceof Error ? err.message : 'Could not load topics.'))
            .finally(() => setLoading(false));
    }, [auth]);

    async function handleStart() {
        if (selectedId == null || starting) return;
        setStarting(true);
        setError(null);
        try {
            await onStart(selectedId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not start session.');
        } finally {
            setStarting(false);
        }
    }

    if (loading) return <p>Loading topics...</p>;

    return (
        <div>
            <h2>Start a session</h2>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
            <div className="action-row">
            <select aria-label="Lesson topic" value={selectedId ?? ''} onChange={(e) => setSelectedId(Number(e.target.value))}>
                {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                        {topic.name}
                    </option>
                ))}
            </select>
            <button onClick={handleStart} disabled={starting || selectedId == null}>
                {starting ? 'Starting...' : 'Start Session'}
            </button>
            </div>
        </div>
    );
}