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
    junk_flag: false,
    buttermilk_flag: false,
    omega3_flag: false,
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
                const saved = allEntries.find(e => e.date === targetDate);

                if (saved) {
                    setHasExistingData(true);

                    // Safe access to nested properties
                    const meals = saved.meals || {};
                    const habits = saved.habits || {};

                    const flatEntry = {
                        ...INITIAL_STATE,
                        ...saved,
                        ...meals,
                        // Explicitly map habits safely
                        junk_flag: habits['Junk Food'] ? true : false,
                        buttermilk_flag: habits['Buttermilk'] ? true : false,
                        omega3_flag: habits['Omega-3'] ? true : false
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

        // Basic Validation
        const weightVal = parseFloat(entry.weight);
        if (!entry.weight || isNaN(weightVal) || weightVal < 30 || weightVal > 200) {
            errors.push('weight');
        }

        // Strict Validation: All meals mandatory
        const requiredFields = ['breakfast', 'mid_snack', 'lunch', 'evening', 'dinner'];
        requiredFields.forEach(field => {
            if (!entry[field] || entry[field].trim() === '') {
                errors.push(field);
            }
        });

        if (errors.length > 0) {
            return { success: false, errors };
        }

        // Prepare data for API (Un-flatten)
        const apiPayload = {
            userId: user.id,
            date: targetDate,
            weight: entry.weight,
            notes: entry.notes,
            meals: {
                breakfast: entry.breakfast,
                lunch: entry.lunch,
                dinner: entry.dinner,
                mid_snack: entry.mid_snack,
                evening: entry.evening
            },
            habits: {
                'Junk Food': entry.junk_flag,
                'Buttermilk': entry.buttermilk_flag,
                'Omega-3': entry.omega3_flag
            }
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
        hasExistingData
    };
}
