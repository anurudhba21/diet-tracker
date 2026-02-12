
import { useState } from 'react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { Plus, Trash2, X, Calendar } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WorkoutManager({ onClose }) {
    const { workouts, addWorkout, removeWorkout } = useWorkouts();
    const [name, setName] = useState('');
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);

    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(prev => prev.filter(d => d !== day));
        } else {
            setSelectedDays(prev => [...prev, day]);
        }
    };

    const handleAdd = async () => {
        if (!name.trim() || !sets || !reps || selectedDays.length === 0) return;

        await addWorkout({
            name,
            sets: parseInt(sets),
            reps: parseInt(reps),
            days: selectedDays
        });

        // Reset form
        setName('');
        setSets('');
        setReps('');
        setSelectedDays([]);
    };

    return (
        <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>
            </div>

            <h2 className="text-gradient" style={{ marginBottom: '24px' }}>Manage Workouts</h2>

            <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '4px', fontSize: '0.8rem' }}>Exercise Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Bench Press"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                        style={{ width: '100%', margin: 0 }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '4px', fontSize: '0.8rem' }}>Sets</label>
                        <input
                            type="number"
                            placeholder="3"
                            value={sets}
                            onChange={(e) => setSets(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', margin: 0 }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '4px', fontSize: '0.8rem' }}>Reps</label>
                        <input
                            type="number"
                            placeholder="12"
                            value={reps}
                            onChange={(e) => setReps(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', margin: 0 }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.8rem' }}>Schedule Days</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {DAYS.map(day => (
                            <button
                                key={day}
                                onClick={() => toggleDay(day)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    border: '1px solid ' + (selectedDays.includes(day) ? 'var(--primary-500)' : 'var(--glass-border)'),
                                    background: selectedDays.includes(day) ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                    color: selectedDays.includes(day) ? 'var(--primary-400)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    className="btn"
                    onClick={handleAdd}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                    disabled={!name || !sets || !reps || selectedDays.length === 0}
                >
                    <Plus size={18} /> Add Workout
                </button>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-main)' }}>Your Routine</h3>
                {workouts.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontSize: '0.9rem' }}>
                        No workouts added yet.
                    </div>
                ) : (
                    workouts.map(workout => (
                        <div key={workout.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            borderLeft: '3px solid var(--primary-500)'
                        }}>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{workout.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {workout.sets} sets x {workout.reps} reps
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--primary-400)', marginTop: '2px' }}>
                                    {workout.days.join(', ')}
                                </div>
                            </div>
                            <button
                                onClick={() => removeWorkout(workout.id)}
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
                    ))
                )}
            </div>
        </div>
    );
}
