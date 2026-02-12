
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

// Initial dummy data removed for custom user creation
const DEMO_WORKOUTS = [];

export function useWorkouts() {
    const { user } = useAuth();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadWorkouts = async () => {
            setLoading(true);
            try {
                const data = await api.getWorkouts(user.id);
                setWorkouts(data);
                // Also keep localStorage as a fallback/cache
                localStorage.setItem(`workouts_${user.id}`, JSON.stringify(data));
            } catch (err) {
                console.error("Failed to load workouts from API", err);
                const saved = localStorage.getItem(`workouts_${user.id}`);
                if (saved) setWorkouts(JSON.parse(saved));
            } finally {
                setLoading(false);
            }
        };

        loadWorkouts();
    }, [user]);

    const addWorkout = async (workout) => {
        const workoutId = workout.id || crypto.randomUUID();
        const newWorkout = {
            ...workout,
            id: workoutId,
            userId: user.id
        };

        try {
            // Save to backend first to satisfy foreign keys
            await api.saveWorkout(newWorkout);
            const updated = [...workouts, newWorkout];
            setWorkouts(updated);
            localStorage.setItem(`workouts_${user.id}`, JSON.stringify(updated));
            return true;
        } catch (err) {
            console.error("Failed to save workout to backend", err);
            alert("Failed to save workout routine to cloud. Please check your connection.");
            return false;
        }
    };

    const removeWorkout = async (id) => {
        try {
            await api.deleteWorkout(id);
            const updated = workouts.filter(w => w.id !== id);
            setWorkouts(updated);
            localStorage.setItem(`workouts_${user.id}`, JSON.stringify(updated));
            return true;
        } catch (err) {
            console.error("Failed to delete workout from backend", err);
            return false;
        }
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
