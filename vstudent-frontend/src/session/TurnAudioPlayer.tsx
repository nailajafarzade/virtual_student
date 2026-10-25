import { useEffect, useState } from 'react';
import type { Credentials } from '../api/types';
import { fetchTurnAudioBlob } from '../api/client';

export function TurnAudioPlayer({ audioUrl, credentials }: { audioUrl: string; credentials: Credentials }) {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let currentUrl: string | null = null;
        let cancelled = false;

        fetchTurnAudioBlob(credentials, audioUrl)
            .then((blob) => {
                if (cancelled) return;
                currentUrl = URL.createObjectURL(blob);
                setObjectUrl(currentUrl);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            });

        return () => {
            cancelled = true;
            if (currentUrl) URL.revokeObjectURL(currentUrl);
        };
    }, [audioUrl, credentials]);

    if (error) return <span style={{ fontSize: '0.8rem', color: '#999' }}>Audio unavailable</span>;
    if (!objectUrl) return <span style={{ fontSize: '0.8rem', color: '#999' }}>Loading audio...</span>;

    return <audio controls src={objectUrl} style={{ height: 32 }} />;
}