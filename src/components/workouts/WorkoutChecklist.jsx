
import { useState } from 'react';
import { CheckCircle, Circle, Plus, Trash2, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';
import { useWorkouts } from '../../hooks/useWorkouts';

export default function WorkoutChecklist({ date, entry, updateEntry }) {
    const { getWorkoutsForDay } = useWorkouts();
    const scheduledWorkouts = getWorkoutsForDay(date);
    const workoutsData = entry.workouts || {};

    // State to track which workout cards are expanded for details
    const [expanded, setExpanded] = useState({});

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getWorkoutState = (id) => {
        const data = workoutsData[id];
        if (!data) return { completed: false, sets: [] };
        if (typeof data === 'boolean') return { completed: data, sets: [] }; // Legacy support
        return data; // { completed, sets: [] }
    };

    const updateWorkoutData = (id, newData) => {
        updateEntry({
            workouts: {
                ...workoutsData,
                [id]: newData
            }
        });
    };

    const toggleWorkoutCompletion = (id) => {
        const current = getWorkoutState(id);
        updateWorkoutData(id, { ...current, completed: !current.completed });
    };

    const addSet = (workout) => {
        const current = getWorkoutState(workout.id);
        const newSetNumber = (current.sets?.length || 0) + 1;

        const newSet = {
            set_number: newSetNumber,
            weight_kg: '',
            reps: workout.reps || 0,
            completed: false
        };

        const newSets = [...(current.sets || []), newSet];
        updateWorkoutData(workout.id, { ...current, sets: newSets });

        // Auto-expand if adding a set
        if (!expanded[workout.id]) {
            setExpanded(prev => ({ ...prev, [workout.id]: true }));
        }
    };

    const updateSet = (workoutId, setIndex, field, value) => {
        const current = getWorkoutState(workoutId);
        const newSets = [...(current.sets || [])];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        updateWorkoutData(workoutId, { ...current, sets: newSets });
    };

    const deleteSet = (workoutId, setIndex) => {
        const current = getWorkoutState(workoutId);
        const newSets = current.sets.filter((_, idx) => idx !== setIndex);
        // Re-number sets
        const reorderedSets = newSets.map((s, idx) => ({ ...s, set_number: idx + 1 }));
        updateWorkoutData(workoutId, { ...current, sets: reorderedSets });
    };

    if (scheduledWorkouts.length === 0) {
        return (
            <div style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                marginBottom: '24px',
                border: '1px solid var(--glass-border)'
            }}>
                <div style={{ opacity: 0.5, marginBottom: '8px' }}>
                    <Dumbbell size={32} />
                </div>
                <p style={{ margin: 0 }}>Rest Day! No workouts scheduled.</p>
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '24px' }}>
            <h3 className="text-gradient" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Today's Session</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
                {scheduledWorkouts.map(workout => {
                    const data = getWorkoutState(workout.id);
                    const isExpanded = expanded[workout.id];

                    return (
                        <div key={workout.id} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                            {/* Header Row */}
                            <div
                                style={{
                                    padding: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: data.completed ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    cursor: 'pointer'
                                }}
                                onClick={() => toggleExpand(workout.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                    <div
                                        onClick={(e) => { e.stopPropagation(); toggleWorkoutCompletion(workout.id); }}
                                        style={{ color: data.completed ? 'var(--primary-400)' : 'var(--text-muted)', cursor: 'pointer' }}
                                    >
                                        {data.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: data.completed ? 'var(--primary-400)' : 'var(--text-main)', fontSize: '1rem' }}>
                                            {workout.name}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Target: {workout.sets} sets x {workout.reps} reps
                                        </div>
                                    </div>
                                </div>
                                <div style={{ color: 'var(--text-muted)' }}>
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {/* Details Section */}
                            {isExpanded && (
                                <div style={{ padding: '16px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                                    {/* Set Headers */}
                                    {(data.sets && data.sets.length > 0) && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 40px', gap: '8px', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                            <div>Set</div>
                                            <div>kg</div>
                                            <div>Reps</div>
                                            <div>✓</div>
                                        </div>
                                    )}

                                    {/* Set Rows */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {data.sets && data.sets.map((set, idx) => (
                                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 40px', gap: '8px', alignItems: 'center' }}>
                                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                    {set.set_number}
                                                </div>
                                                <input
                                                    type="number"
                                                    placeholder="kg"
                                                    value={set.weight_kg}
                                                    onChange={(e) => updateSet(workout.id, idx, 'weight_kg', e.target.value)}
                                                    className="input-field"
                                                    style={{ margin: 0, padding: '6px', textAlign: 'center' }}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder={workout.reps}
                                                    value={set.reps}
                                                    onChange={(e) => updateSet(workout.id, idx, 'reps', e.target.value)}
                                                    className="input-field"
                                                    style={{ margin: 0, padding: '6px', textAlign: 'center' }}
                                                />
                                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => updateSet(workout.id, idx, 'completed', !set.completed)}
                                                        style={{
                                                            background: set.completed ? 'var(--primary-500)' : 'rgba(255,255,255,0.1)',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            width: '28px',
                                                            height: '28px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {set.completed && <CheckCircle size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => addSet(workout)}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                borderRadius: '8px',
                                                border: '1px dashed var(--glass-border)',
                                                background: 'rgba(255,255,255,0.02)',
                                                color: 'var(--text-muted)',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <Plus size={16} /> Add Set
                                        </button>

                                        {(data.sets && data.sets.length > 0) && (
                                            <button
                                                onClick={() => deleteSet(workout.id, data.sets.length - 1)}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
