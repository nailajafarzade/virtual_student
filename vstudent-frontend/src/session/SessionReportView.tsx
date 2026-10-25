import type { SessionReport } from '../api/types';

function formatMetricKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export function SessionReportView({ report, onBack }: { report: SessionReport; onBack: () => void }) {
    return (
        <div>
            <h2>Session report</h2>
            <p>{report.summaryText}</p>

            {report.highlights.length > 0 && (
                <>
                    <h3>Highlights</h3>
                    <ul>
                        {report.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                        ))}
                    </ul>
                </>
            )}

            <h3>Metrics</h3>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                {Object.entries(report.metrics).map(([key, value]) => (
                    <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.25rem 0.5rem 0.25rem 0', color: '#666' }}>{formatMetricKey(key)}</td>
                        <td style={{ padding: '0.25rem 0' }}>{value}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <button onClick={onBack} style={{ marginTop: '1rem' }}>
                ← Back to sessions
            </button>
        </div>
    );
}