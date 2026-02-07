export default function StreakCard({ streaks }) {
    const { current, longest } = streaks || { current: 0, longest: 0 };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="glass-panel" style={{
                textAlign: 'center',
                marginBottom: 0,
                background: 'rgba(249, 115, 22, 0.1)', // Orange-tinted glass
                borderColor: 'rgba(249, 115, 22, 0.2)'
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px', filter: 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.5))' }}>🔥</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fb923c' }}>{current}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Streak</div>
            </div>

            <div className="glass-panel" style={{
                textAlign: 'center',
                marginBottom: 0,
                background: 'rgba(34, 197, 94, 0.1)', // Green-tinted glass
                borderColor: 'rgba(34, 197, 94, 0.2)'
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px', filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))' }}>🏆</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#4ade80' }}>{longest}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Longest Streak</div>
            </div>
        </div>
    );
}
