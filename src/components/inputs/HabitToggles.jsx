const HABITS = [
    { id: 'junk_flag', label: 'Ate Junk Food?' },
    { id: 'buttermilk_flag', label: 'Drank Buttermilk?' },
    { id: 'omega3_flag', label: 'Took Omega-3?' }
];

export default function HabitToggles({ data, onChange }) {
    return (
        <div className="card">
            <h3 className="input-label" style={{ marginBottom: 'var(--space-3)' }}>Habits</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {HABITS.map((habit) => (
                    <div key={habit.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-2) 0' }}>
                        <span style={{ fontWeight: 500 }}>{habit.label}</span>
                        <button
                            className="btn"
                            style={{
                                width: 'auto',
                                padding: 'var(--space-2) var(--space-4)',
                                backgroundColor: data[habit.id] ? 'var(--color-primary)' : 'var(--color-border)',
                                color: data[habit.id] ? 'white' : 'var(--color-text)',
                            }}
                            onClick={() => onChange(habit.id, !data[habit.id])}
                        >
                            {data[habit.id] ? 'YES' : 'NO'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
