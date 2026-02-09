import { useState } from 'react';
import { useHabits } from '../../hooks/useHabits';
import { Plus, Trash2, X, Bell, BellOff } from 'lucide-react';

export default function HabitManager({ onClose }) {
    const { habits, addHabit, removeHabit, notificationsEnabled, requestNotificationPermission } = useHabits();
    const [newHabitName, setNewHabitName] = useState('');
    const [timeOfDay, setTimeOfDay] = useState('any');

    const handleAdd = async () => {
        if (!newHabitName.trim()) return;
        const success = await addHabit(newHabitName, timeOfDay);
        if (success) {
            setNewHabitName('');
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                <button
                    onClick={requestNotificationPermission}
                    className="btn-ghost"
                    style={{
                        padding: '4px 8px',
                        fontSize: '0.8rem',
                        color: notificationsEnabled ? 'var(--primary-500)' : 'var(--text-muted)',
                        border: notificationsEnabled ? '1px solid var(--primary-500)' : '1px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                    title={notificationsEnabled ? "Reminders Enabled" : "Enable Reminders"}
                >
                    {notificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                    {notificationsEnabled ? 'On' : 'Off'}
                </button>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>
            </div>

            <h2 className="text-gradient" style={{ marginBottom: '24px' }}>Customize Habits</h2>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <input
                    type="text"
                    placeholder="New habit (e.g., Drink Water)"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    className="input-field"
                    style={{ flex: 1, margin: 0 }}
                />
                <select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="input-field"
                    style={{ width: '120px', margin: 0 }}
                >
                    <option value="any">Any Time</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                </select>
                <button className="btn" onClick={handleAdd} style={{ width: 'auto' }}>
                    <Plus size={20} />
                </button>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {habits.map(habit => (
                    <div key={habit.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                        marginBottom: '8px'
                    }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>{habit.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                {habit.time_of_day || 'Any Time'}
                            </div>
                        </div>
                        <button
                            onClick={() => removeHabit(habit.id)}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: 'none',
                                padding: '8px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                {habits.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                        No habits found. Add one above!
                    </div>
                )}
            </div>
        </div>
    );
}
