export default function MetricCard({ label, value, unit, color = 'var(--primary-500)', isPrimary, fullWidth }) { // Updated default color
    const cardStyle = {
        padding: '20px', // Increased padding
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 0,
        gridColumn: fullWidth ? '1 / -1' : 'auto',
        background: isPrimary ? 'linear-gradient(135deg, var(--primary-500), var(--primary-600))' : 'var(--glass-surface)', // Gradient for primary
        color: isPrimary ? 'white' : 'var(--text-main)', // Updated text var
        border: isPrimary ? 'none' : '1px solid var(--glass-border)', // Border for non-primary
        boxShadow: isPrimary ? '0 8px 20px var(--primary-glow)' : 'var(--glass-shadow)',
        justifyContent: 'center'
    };

    const labelStyle = {
        fontSize: '0.75rem', // Slightly smaller
        color: isPrimary ? 'rgba(255, 255, 255, 0.9)' : 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '1px', // Increased letter spacing
        marginBottom: '8px',
        fontWeight: 600
    };

    const valueStyle = {
        fontSize: isPrimary ? '2.5rem' : '2rem', // Adjusted sizing
        fontWeight: 800, // Bolder
        color: isPrimary ? 'white' : color,
        lineHeight: 1,
        textShadow: isPrimary ? '0 2px 10px rgba(0,0,0,0.1)' : 'none'
    };

    const unitStyle = {
        fontSize: '0.9rem',
        color: isPrimary ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-muted)',
        marginLeft: '4px',
        fontWeight: 500
    };

    return (
        <div className={isPrimary ? 'btn' : 'glass-panel'} style={{ ...cardStyle, borderRadius: '24px' }}> {/* Forced radius overload if needed, but glass-panel has it */}
            <span style={labelStyle}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span style={valueStyle}>{value || '-'}</span>
                {unit && <span style={unitStyle}>{unit}</span>}
            </div>
        </div>
    );
}
