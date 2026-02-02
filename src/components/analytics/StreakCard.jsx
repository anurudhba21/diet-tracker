export default function StreakCard({ streaks }) {
    const { current, longest } = streaks || { current: 0, longest: 0 };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div className="card" style={{ textAlign: 'center', marginBottom: 0, background: 'linear-gradient(to bottom right, #fff7ed, #fff)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-1)' }}>🔥</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ea580c' }}>{current}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Current Streak</div>
            </div>

            <div className="card" style={{ textAlign: 'center', marginBottom: 0, background: 'linear-gradient(to bottom right, #f0fdf4, #fff)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-1)' }}>🏆</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>{longest}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Longest Streak</div>
            </div>
        </div>
    );
}
