import { useHabits } from '../../hooks/useHabits';
import { Settings } from 'lucide-react';
import HabitManager from '../habits/HabitManager';
import { useState } from 'react';

export default function HabitToggles({ data, onChange }) {
    const { habits, loading } = useHabits();
    const [showManager, setShowManager] = useState(false);

    if (loading) return <div>Loading habits...</div>;

    const toggleHabit = (habitName) => {
        // data.habits is { "Habit Name": true/false }
        const currentStatus = data.habits ? data.habits[habitName] : false;
        const newHabits = { ...data.habits, [habitName]: !currentStatus };
        // We pass the entire habits object back to onChange, assuming parent handles it
        // BUT logic in DailyEntry.jsx expects id, value. 
        // We should probably change how DailyEntry handles this or adapter here.
        // Let's adapt here: onChange usually takes (id, value). 
        // In useDailyEntry refactor, we stored habits as an object in 'habits' key.
        // So we should call onChange('habits', newHabits).
        onChange('habits', newHabits);
    };

    // Filter out 'Junk Food' as it's now a core metric
    const customHabits = habits.filter(h => h.name !== 'Junk Food');

    const morningHabits = customHabits.filter(h => h.time_of_day === 'morning');
    const afternoonHabits = customHabits.filter(h => h.time_of_day === 'afternoon');
    const eveningHabits = customHabits.filter(h => h.time_of_day === 'evening');
    const anyTimeHabits = customHabits.filter(h => !h.time_of_day || h.time_of_day === 'any');

    const renderGroup = (title, items) => {
        if (items.length === 0) return null;
        return (
            <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {items.map(habit => (
                        <div key={habit.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                            <span style={{ fontWeight: 500 }}>{habit.name}</span>
                            <button
                                className="btn"
                                style={{
                                    width: 'auto',
                                    padding: '6px 16px',
                                    backgroundColor: (data.habits && data.habits[habit.name]) ? 'var(--primary-500)' : 'var(--glass-bg)',
                                    border: (data.habits && data.habits[habit.name]) ? 'none' : '1px solid var(--glass-border)',
                                    color: (data.habits && data.habits[habit.name]) ? 'white' : 'var(--text-muted)',
                                }}
                                onClick={() => toggleHabit(habit.name)}
                            >
                                {(data.habits && data.habits[habit.name]) ? 'YES' : 'NO'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="input-label" style={{ margin: 0 }}>Habits <span style={{ fontSize: '0.7em', opacity: 0.5 }}>v1.1</span></h3>
                <button
                    onClick={() => setShowManager(!showManager)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-500)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                    <Settings size={16} /> Manage
                </button>
            </div>

            {showManager && (
                <div style={{ marginBottom: '24px' }}>
                    <HabitManager onClose={() => setShowManager(false)} />
                </div>
            )}

            {renderGroup('Morning', morningHabits)}
            {renderGroup('Afternoon', afternoonHabits)}
            {renderGroup('Evening', eveningHabits)}
            {renderGroup('Any Time', anyTimeHabits)}

            {habits.length === 0 && !showManager && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                    No habits configured. Click "Manage" to add some!
                </div>
            )}
        </div>
    );
}
