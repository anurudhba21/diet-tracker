export default function HabitStats({ stats }) {
    if (!stats) return null;

    const HabitRow = ({ label, value, color }) => (
        <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                <span style={{ textTransform: 'capitalize' }}>{label}</span>
                <span style={{ fontWeight: '700', color }}>{value}%</span>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '10px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: `0 0 10px ${color}` }} />
            </div>
        </div>
    );

    // Filter out total and keys with 0% to keep it clean, or show all?
    // Let's show all except total.
    const habits = Object.keys(stats).filter(k => k !== 'total');

    return (
        <div className="glass-panel">
            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Habit Consistency</h3>

            {habits.map((habit, index) => {
                // Generate a consistent color based on index or name?
                // Let's cycle through some nice colors
                const colors = ['var(--primary-500)', 'var(--accent-blue)', '#f472b6', '#34d399', '#fbbf24'];
                const color = colors[index % colors.length];

                return (
                    <HabitRow
                        key={habit}
                        label={habit}
                        value={stats[habit]}
                        color={color}
                    />
                );
            })}

            {habits.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No habits tracked yet.</p>
            )}

            <p style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', opacity: 0.7 }}>
                Based on {stats.total || 0} logged days
            </p>
        </div>
    );
}
