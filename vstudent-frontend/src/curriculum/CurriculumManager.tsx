import { useEffect, useState, type FormEvent } from 'react';
import type { CurriculumTopic, CurriculumTopicInput } from '../api/types';
import {
    createCurriculumTopic,
    deleteCurriculumTopic,
    getCurriculumTopics,
    updateCurriculumTopic,
} from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface FormState {
    name: string;
    objective: string;
    difficultyLevel: number;
    exampleQuestions: string;
    acceptableAnswers: string;
    commonMisconceptions: string;
}

const EMPTY_FORM: FormState = {
    name: '',
    objective: '',
    difficultyLevel: 1,
    exampleQuestions: '',
    acceptableAnswers: '',
    commonMisconceptions: '',
};

function linesToList(text: string): string[] {
    return text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
}

function topicToForm(topic: CurriculumTopic): FormState {
    return {
        name: topic.name,
        objective: topic.objective,
        difficultyLevel: topic.difficultyLevel,
        exampleQuestions: topic.exampleQuestions.join('\n'),
        acceptableAnswers: topic.acceptableAnswers.join('\n'),
        commonMisconceptions: topic.commonMisconceptions.join('\n'),
    };
}

export function CurriculumManager({ onBack }: { onBack: () => void }) {
    const { auth } = useAuth();
    const [topics, setTopics] = useState<CurriculumTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // null = forma bağlıdır, 'new' = yeni mövzu, number = redaktə olunan mövzunun id-si
    const [editing, setEditing] = useState<'new' | number | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!auth) return;
        getCurriculumTopics(auth.credentials)
            .then(setTopics)
            .catch((err) => setError(err instanceof Error ? err.message : 'Could not load topics.'))
            .finally(() => setLoading(false));
    }, [auth]);

    function startNew() {
        setForm(EMPTY_FORM);
        setEditing('new');
        setError(null);
    }

    function startEdit(topic: CurriculumTopic) {
        setForm(topicToForm(topic));
        setEditing(topic.id);
        setError(null);
    }

    function cancelEdit() {
        setEditing(null);
        setError(null);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!auth || editing == null) return;

        const input: CurriculumTopicInput = {
            name: form.name.trim(),
            objective: form.objective.trim(),
            difficultyLevel: form.difficultyLevel,
            exampleQuestions: linesToList(form.exampleQuestions),
            acceptableAnswers: linesToList(form.acceptableAnswers),
            commonMisconceptions: linesToList(form.commonMisconceptions),
        };

        setSaving(true);
        setError(null);
        try {
            if (editing === 'new') {
                const created = await createCurriculumTopic(auth.credentials, input);
                setTopics((prev) => [...prev, created]);
            } else {
                const updated = await updateCurriculumTopic(auth.credentials, editing, input);
                setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            }
            setEditing(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save topic.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(topic: CurriculumTopic) {
        if (!auth) return;
        if (!confirm(`Delete "${topic.name}"?`)) return;
        setError(null);
        try {
            await deleteCurriculumTopic(auth.credentials, topic.id);
            setTopics((prev) => prev.filter((t) => t.id !== topic.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not delete topic.');
        }
    }

    if (editing != null) {
        return (
            <form onSubmit={handleSubmit}>
                <h2>{editing === 'new' ? 'New topic' : 'Edit topic'}</h2>
                <label>
                    Name
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </label>
                <label>
                    Objective
                    <textarea
                        rows={2}
                        value={form.objective}
                        onChange={(e) => setForm({ ...form, objective: e.target.value })}
                        required
                    />
                </label>
                <label>
                    Difficulty level
                    <input
                        type="number"
                        min={1}
                        value={form.difficultyLevel}
                        onChange={(e) => setForm({ ...form, difficultyLevel: Number(e.target.value) })}
                        required
                    />
                </label>
                <label>
                    Example questions (one per line)
                    <textarea
                        rows={3}
                        value={form.exampleQuestions}
                        onChange={(e) => setForm({ ...form, exampleQuestions: e.target.value })}
                    />
                </label>
                <label>
                    Acceptable answers (one per line)
                    <textarea
                        rows={3}
                        value={form.acceptableAnswers}
                        onChange={(e) => setForm({ ...form, acceptableAnswers: e.target.value })}
                    />
                </label>
                <label>
                    Common misconceptions (one per line)
                    <textarea
                        rows={3}
                        value={form.commonMisconceptions}
                        onChange={(e) => setForm({ ...form, commonMisconceptions: e.target.value })}
                    />
                </label>
                {error && <p style={{ color: 'crimson' }}>{error}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" onClick={cancelEdit}>
                        Cancel
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div>
            <button onClick={onBack} style={{ marginBottom: '1rem' }}>
                ← Back to sessions
            </button>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Curriculum</h2>
                <button onClick={startNew}>+ New topic</button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'crimson' }}>{error}</p>}

            {topics.map((topic) => (
                <div
                    key={topic.id}
                    style={{
                        display: 'flex', flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 0',
                        borderBottom: '1px solid #eee',
                        gap: '1rem',
                    }}
                >
                    <div>
                        <strong>{topic.name}</strong>{' '}
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>(difficulty {topic.difficultyLevel})</span>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{topic.objective}</div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                        <button onClick={() => startEdit(topic)}>Edit</button>
                        <button onClick={() => handleDelete(topic)} style={{ background: '#dc2626' }}>
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}