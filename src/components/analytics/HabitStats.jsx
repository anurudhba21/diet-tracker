export default function HabitStats({ stats }) {
    if (!stats) return null;

    const HabitRow = ({ label, value, color }) => (
        <div style={{ marginBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)', fontSize: '0.9rem' }}>
                <span>{label}</span>
                <span style={{ fontWeight: 'bold', color }}>{value}%</span>
            </div>
            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${value}%`, height: '100%', background: color, transition: 'width 0.5s ease' }} />
            </div>
        </div>
    );

    return (
        <div className="card">
            <h3 style={{ marginBottom: 'var(--space-3)', fontSize: '1rem' }}>Habit Consistency</h3>
            <HabitRow label="No Junk Food" value={100 - stats.junk} color="#ef4444" />
            <HabitRow label="Buttermilk" value={stats.buttermilk} color="#3b82f6" />
            <HabitRow label="Omega-3" value={stats.omega3} color="#10b981" />
            <p style={{ marginTop: 'var(--space-3)', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                Based on {stats.total} logged days
            </p>
        </div>
    );
}
