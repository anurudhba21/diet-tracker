export default function MetricCard({ label, value, unit, color = 'var(--color-primary)' }) {
    return (
        <div className="card" style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 0 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: color }}>
                    {value || '-'}
                </span>
                {unit && <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{unit}</span>}
            </div>
        </div>
    );
}
