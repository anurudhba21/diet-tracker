
import { useState } from 'react';
import { CheckCircle, Circle, Plus, Trash2, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkoutChecklist({ date, entry, updateEntry }) {
    const { getWorkoutsForDay, workouts: allRoutine } = useWorkouts();
    const scheduledWorkouts = getWorkoutsForDay(date);
    const workoutsData = entry.workouts || {};
    const [showAddMenu, setShowAddMenu] = useState(false);

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

    // Combine scheduled workouts with any that are already in the entry (manually added or previous saves)
    const activeWorkoutIds = Object.keys(workoutsData);
    const displayWorkouts = [...scheduledWorkouts];

    activeWorkoutIds.forEach(id => {
        if (!displayWorkouts.find(w => w.id === id)) {
            const routineData = allRoutine.find(r => r.id === id);
            if (routineData) {
                displayWorkouts.push(routineData);
            }
        }
    });

    const availableToAdd = allRoutine.filter(r => !displayWorkouts.find(w => w.id === r.id));

    const handleAddManual = (workout) => {
        updateEntry({
            workouts: {
                ...workoutsData,
                [workout.id]: {
                    completed: false,
                    sets: Array.from({ length: workout.sets }, (_, i) => ({
                        set_number: i + 1,
                        weight_kg: '',
                        reps: workout.reps,
                        completed: false
                    }))
                }
            }
        });
        setShowAddMenu(false);
    };

    return (
        <div style={{ display: 'grid', gap: '16px', marginBottom: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 className="text-gradient" style={{ margin: 0, fontSize: '1.2rem' }}>Workout Session</h3>
                <button
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="btn-sm"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-main)',
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={14} /> Add from Routine
                </button>
            </div>

            <AnimatePresence>
                {showAddMenu && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderStyle: 'dashed', marginBottom: '16px' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Choose an exercise to add to today's log:</p>
                            {availableToAdd.length === 0 ? (
                                <p style={{ fontSize: '0.85rem', textAlign: 'center', padding: '10px', color: 'var(--text-dim)' }}>
                                    No more exercises in your routine.
                                </p>
                            ) : (
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {availableToAdd.map(w => (
                                        <button
                                            key={w.id}
                                            onClick={() => handleAddManual(w)}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '12px 16px',
                                                background: 'rgba(255,255,255,0.03)',
                                                borderRadius: '12px',
                                                border: '1px solid var(--glass-border)',
                                                color: 'var(--text-main)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Dumbbell size={16} className="text-secondary" />
                                                <span style={{ fontWeight: 500 }}>{w.name}</span>
                                            </div>
                                            <Plus size={16} className="text-primary" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {displayWorkouts.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '48px 24px', opacity: 0.8 }}>
                    <div style={{ marginBottom: '16px', color: 'var(--text-dim)', opacity: 0.3 }}>
                        <Dumbbell size={48} />
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: 600 }}>No workouts scheduled today.</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '200px', margin: '8px auto 0' }}>
                        Click <b>"Add from Routine"</b> above to log an unscheduled workout.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {displayWorkouts.map(workout => {
                        const data = getWorkoutState(workout.id);
                        const isExpanded = expanded[workout.id];

                        return (
                            <div key={workout.id} className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: data.completed ? '1px solid var(--primary-500)' : '1px solid var(--glass-border)' }}>
                                {/* Header Row */}
                                <div
                                    style={{
                                        padding: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: data.completed ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => toggleExpand(workout.id)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                        <div
                                            onClick={(e) => { e.stopPropagation(); toggleWorkoutCompletion(workout.id); }}
                                            style={{ color: data.completed ? 'var(--primary-500)' : 'var(--text-dim)', cursor: 'pointer' }}
                                        >
                                            {data.completed ? <CheckCircle size={28} /> : <Circle size={28} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: data.completed ? 'var(--primary-400)' : 'var(--text-main)', fontSize: '1.05rem' }}>
                                                {workout.name}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                Target: {workout.sets} sets x {workout.reps} reps
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ color: 'var(--text-dim)' }}>
                                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>

                                {/* Details Section */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{
                                                overflow: 'hidden',
                                                borderTop: '1px solid var(--glass-border)',
                                                background: 'rgba(0,0,0,0.15)'
                                            }}
                                        >
                                            <div style={{ padding: '16px' }}>
                                                {/* Set Headers */}
                                                {(data.sets && data.sets.length > 0) && (
                                                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 40px', gap: '12px', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                        <div>Set</div>
                                                        <div>kg</div>
                                                        <div>Reps</div>
                                                        <div>✓</div>
                                                    </div>
                                                )}

                                                {/* Set Rows */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {data.sets && data.sets.map((set, idx) => (
                                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 40px', gap: '12px', alignItems: 'center' }}>
                                                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                                {set.set_number}
                                                            </div>
                                                            <input
                                                                type="number"
                                                                placeholder="0"
                                                                value={set.weight_kg}
                                                                onChange={(e) => updateSet(workout.id, idx, 'weight_kg', e.target.value)}
                                                                className="input-field"
                                                                style={{ margin: 0, padding: '8px', textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder={workout.reps}
                                                                value={set.reps}
                                                                onChange={(e) => updateSet(workout.id, idx, 'reps', e.target.value)}
                                                                className="input-field"
                                                                style={{ margin: 0, padding: '8px', textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}
                                                            />
                                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                                <button
                                                                    onClick={() => updateSet(workout.id, idx, 'completed', !set.completed)}
                                                                    style={{
                                                                        background: set.completed ? 'var(--primary-500)' : 'rgba(255,255,255,0.05)',
                                                                        border: '1px solid ' + (set.completed ? 'var(--primary-400)' : 'var(--glass-border)'),
                                                                        borderRadius: '6px',
                                                                        width: '32px',
                                                                        height: '32px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        cursor: 'pointer',
                                                                        color: 'white'
                                                                    }}
                                                                >
                                                                    {set.completed && <CheckCircle size={18} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Actions */}
                                                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                                    <button
                                                        onClick={() => addSet(workout)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '10px',
                                                            borderRadius: '10px',
                                                            border: '1px dashed var(--glass-border)',
                                                            background: 'rgba(255,255,255,0.02)',
                                                            color: 'var(--text-main)',
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '8px'
                                                        }}
                                                    >
                                                        <Plus size={18} className="text-secondary" /> Add Set
                                                    </button>

                                                    {(data.sets && data.sets.length > 0) && (
                                                        <button
                                                            onClick={() => deleteSet(workout.id, data.sets.length - 1)}
                                                            style={{
                                                                padding: '10px',
                                                                borderRadius: '10px',
                                                                border: '1px solid rgba(239, 68, 68, 0.1)',
                                                                background: 'rgba(239, 68, 68, 0.05)',
                                                                color: '#ef4444',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
