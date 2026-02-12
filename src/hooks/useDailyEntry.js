import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const INITIAL_STATE = {
    weight: '',
    breakfast: '',
    mid_snack: '',
    lunch: '',
    evening: '',
    dinner: '',
    habits: {}, // Dynamic habits: { "Habit Name": true/false }
    workouts: {}, // Workouts: { "workoutId": { completed, sets: [] } }
    notes: ''
};

export function useDailyEntry(dateStr) {
    console.log("Full Hook: executing...");
    const authContext = useAuth();
    // Debugging crash
    if (authContext === undefined) {
        console.error("useDailyEntry: AuthContext is undefined! Component likely outside AuthProvider.");
    }
    const user = authContext ? authContext.user : null;

    // Check API
    if (!api) {
        console.error("useDailyEntry: API import is missing!");
    } else {
        console.log("API Import: OK", api);
    }

    const [entry, setEntry] = useState(INITIAL_STATE);
    const [hasExistingData, setHasExistingData] = useState(false);
    const [previousWeight, setPreviousWeight] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const targetDate = dateStr || new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (!user) return;
        if (!api) return;

        const loadEntry = async () => {
            console.log("Loading entry for:", user.id, targetDate);
            try {
                // For MVP simplicity, we fetch all entries and find the one matching the date.
                const allEntries = await api.getEntries(user.id);
                console.log("API Response:", allEntries);

                // Safety check: Ensure proper array response
                if (!Array.isArray(allEntries)) {
                    console.error("API Error: getEntries did not return an array", allEntries);
                    return;
                }

                // The API returns an array, we need to find the specific date
                const sortedEntries = allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
                const saved = sortedEntries.find(e => e.date === targetDate);

                // Find previous weight for anomaly detection
                const prev = sortedEntries.find(e => new Date(e.date) < new Date(targetDate) && e.weight);
                setPreviousWeight(prev ? prev.weight : null);

                if (saved) {
                    setHasExistingData(true);

                    // Safe access to nested properties
                    const meals = saved.meals || {};
                    const habits = saved.habits || {};
                    const workouts = saved.workouts || {}; // Load workouts

                    const flatEntry = {
                        ...INITIAL_STATE,
                        ...saved,
                        ...meals,
                        habits: habits, // Load habits directly
                        workouts: workouts, // Load workouts directly
                        junk: !!saved.junk // Ensure boolean
                    };

                    setEntry(flatEntry);
                } else {
                    setHasExistingData(false);
                    setEntry(INITIAL_STATE);
                }
            } catch (err) {
                console.error("Failed to load entry", err);
                // Fallback to initial state on error to prevent blank screen
                setEntry(INITIAL_STATE);
            }
        };

        loadEntry();
    }, [targetDate, user]);

    const updateEntry = (updates) => {
        setEntry(prev => ({ ...prev, ...updates }));
        setIsSaved(false);
    };

    const saveEntry = async () => {
        if (!user) return { success: false, errors: [] };

        const errors = [];

        // Basic Validation - Weight is now optional but must be valid if provided
        let weightVal = null;
        if (entry.weight && entry.weight.toString().trim() !== '') {
            weightVal = parseFloat(entry.weight);
            if (isNaN(weightVal) || weightVal < 30 || weightVal > 250) {
                errors.push('weight');
            }
        }

        if (errors.length > 0) {
            alert("Please provide a valid weight (30-250kg) or leave it empty.");
            return { success: false, errors };
        }

        // Prepare data for API (Un-flatten)
        const apiPayload = {
            userId: user.id,
            date: targetDate,
            weight: weightVal, // Pass as number or null
            notes: entry.notes,
            meals: {
                breakfast: entry.breakfast,
                lunch: entry.lunch,
                dinner: entry.dinner,
                mid_snack: entry.mid_snack,
                evening: entry.evening
            },
            habits: entry.habits,
            workouts: entry.workouts
        };

        try {
            await api.saveEntry(apiPayload);
            setIsSaved(true);
            setHasExistingData(true); // Mark as existing after save
            setTimeout(() => setIsSaved(false), 2000);
            return { success: true };
        } catch (err) {
            console.error("Failed to save", err);
            alert("Failed to save entry"); // Keep backup alert for API failure
            return { success: false, errors: [] };
        }
    };

    const deleteEntry = async () => {
        if (entry.id) {
            try {
                await api.deleteEntry(entry.id);
                setHasExistingData(false);
                setEntry(INITIAL_STATE);
                return true;
            } catch (e) {
                console.error("Delete failed", e);
                return false;
            }
        }
        return false;
    };

    return {
        entry,
        updateEntry,
        saveEntry,
        deleteEntry,
        isSaved,
        isSaved,
        hasExistingData,
        previousWeight
    };
}
