import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';

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
    const { user } = useAuth();
    const [entry, setEntry] = useState(INITIAL_STATE);
    const [isSaved, setIsSaved] = useState(false);
    const targetDate = dateStr || new Date().toDateString();

    // Load from storage on mount or when date changes
    useEffect(() => {
        if (user) {
            const entries = storage.getEntries(user.id);
            const saved = entries[targetDate];
            if (saved) {
                setEntry(prev => ({ ...prev, ...saved }));
            } else {
                setEntry(INITIAL_STATE); // Reset if no data for this date
            }
        }
    }, [targetDate, user]);

    const updateEntry = (updates) => {
        setEntry(prev => ({ ...prev, ...updates }));
        setIsSaved(false);
    };

    const saveEntry = () => {
        if (!user) return;

        // Basic Validation
        const weightVal = parseFloat(entry.weight);
        if (entry.weight && (isNaN(weightVal) || weightVal < 30 || weightVal > 200)) {
            alert("Please enter a valid weight between 30kg and 200kg.");
            return;
        }

        storage.saveEntry(targetDate, entry, user.id);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const deleteEntry = () => {
        if (!user) return false;
        if (confirm("Are you sure you want to delete this entry?")) {
            storage.deleteEntry(targetDate, user.id);
            return true; // Signal success
        }
        return false;
    };

    return {
        entry,
        updateEntry,
        saveEntry,
        deleteEntry,
        isSaved
    };
}
