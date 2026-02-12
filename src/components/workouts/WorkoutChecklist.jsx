
import { CheckCircle, Circle } from 'lucide-react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useDailyEntry } from '../../hooks/useDailyEntry';

export default function WorkoutChecklist({ date, entry, updateEntry }) {
    const { getWorkoutsForDay } = useWorkouts();

    // Get scheduled workouts for this specific date
    const scheduledWorkouts = getWorkoutsForDay(date);

    // entry.workouts is expected to be { "workoutId": true/false }
    const completedWorkouts = entry.workouts || {};

    const toggleWorkout = (id) => {
        const newState = !completedWorkouts[id];
        updateEntry({
            workouts: {
                ...completedWorkouts,
                [id]: newState
            }
        });
    };

    if (scheduledWorkouts.length === 0) {
        return (
            <div style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                marginBottom: '24px'
            }}>
                Rest Day! No workouts scheduled.
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '24px' }}>
            <h3 className="text-gradient" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Today's Workout</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
                {scheduledWorkouts.map(workout => {
                    const isCompleted = completedWorkouts[workout.id];
                    return (
                        <div
                            key={workout.id}
                            onClick={() => toggleWorkout(workout.id)}
                            className="glass-panel"
                            style={{
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                border: isCompleted ? '1px solid var(--primary-500)' : '1px solid var(--glass-border)',
                                background: isCompleted ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 600, color: isCompleted ? 'var(--primary-400)' : 'var(--text-main)' }}>
                                    {workout.name}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {workout.sets} sets x {workout.reps} reps
                                </div>
                            </div>

                            <div style={{
                                color: isCompleted ? 'var(--primary-400)' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {isCompleted ? <CheckCircle size={24} /> : <Circle size={24} />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
