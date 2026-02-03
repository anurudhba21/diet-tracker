export default function MetricCard({ label, value, unit, color = 'var(--color-primary)', isPrimary, fullWidth }) {
    const cardStyle = {
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 0,
        gridColumn: fullWidth ? '1 / -1' : 'auto',
        background: isPrimary ? 'var(--color-primary)' : 'var(--color-surface-glass)',
        color: isPrimary ? 'white' : 'var(--color-text)'
    };

    const labelStyle = {
        fontSize: '0.85rem',
        color: isPrimary ? 'rgba(255, 255, 255, 0.9)' : 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: 'var(--space-1)'
    };

    const valueStyle = {
        fontSize: isPrimary ? '2.5rem' : '1.8rem',
        fontWeight: 'bold',
        color: isPrimary ? 'white' : color,
        lineHeight: 1
    };

    const unitStyle = {
        fontSize: '0.9rem',
        color: isPrimary ? 'rgba(255, 255, 255, 0.8)' : 'var(--color-text-muted)',
        marginLeft: '4px'
    };

    return (
        <div className="card" style={cardStyle}>
            <span style={labelStyle}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span style={valueStyle}>{value || '-'}</span>
                {unit && <span style={unitStyle}>{unit}</span>}
            </div>
        </div>
    );
}
