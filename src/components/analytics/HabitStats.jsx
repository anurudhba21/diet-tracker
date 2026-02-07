export default function HabitStats({ stats }) {
    if (!stats) return null;

    const HabitRow = ({ label, value, color }) => (
        <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                <span>{label}</span>
                <span style={{ fontWeight: '700', color }}>{value}%</span>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '10px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: `0 0 10px ${color}` }} />
            </div>
        </div>
    );

    return (
        <div className="glass-panel">
            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Habit Consistency</h3>
            <HabitRow label="No Junk Food" value={100 - stats.junk} color="var(--danger)" />
            <HabitRow label="Buttermilk" value={stats.buttermilk} color="var(--accent-blue)" />
            <HabitRow label="Omega-3" value={stats.omega3} color="var(--primary-500)" />
            <p style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', opacity: 0.7 }}>
                Based on {stats.total} logged days
            </p>
        </div>
    );
}
