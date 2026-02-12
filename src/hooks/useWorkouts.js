
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

// Initial dummy data for testing UI before backend is fully ready for this specific feature
// In a real scenario, this would be empty or fetched from API
const DEMO_WORKOUTS = [
    { id: '1', name: 'Push Ups', sets: 3, reps: 15, days: ['Mon', 'Wed', 'Fri'] },
    { id: '2', name: 'Squats', sets: 4, reps: 12, days: ['Tue', 'Thu'] }
];

export function useWorkouts() {
    const { user } = useAuth();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        // Simulate fetching from API
        // In real impl: const data = await api.getWorkouts(user.id);
        setTimeout(() => {
            const saved = localStorage.getItem(`workouts_${user.id}`);
            if (saved) {
                setWorkouts(JSON.parse(saved));
            } else {
                setWorkouts(DEMO_WORKOUTS);
            }
            setLoading(false);
        }, 500);
    }, [user]);

    const addWorkout = async (workout) => {
        const newWorkout = { ...workout, id: crypto.randomUUID() };
        const updated = [...workouts, newWorkout];
        setWorkouts(updated);
        localStorage.setItem(`workouts_${user.id}`, JSON.stringify(updated));
        // api.saveWorkout(newWorkout); 
        return true;
    };

    const removeWorkout = async (id) => {
        const updated = workouts.filter(w => w.id !== id);
        setWorkouts(updated);
        localStorage.setItem(`workouts_${user.id}`, JSON.stringify(updated));
        // api.deleteWorkout(id);
        return true;
    };

    const getWorkoutsForDay = (dateStr) => {
        const date = new Date(dateStr);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue"...
        return workouts.filter(w => w.days.includes(dayName));
    };

    return {
        workouts,
        loading,
        addWorkout,
        removeWorkout,
        getWorkoutsForDay
    };
}
