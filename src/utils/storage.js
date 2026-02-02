const LEGACY_STORAGE_KEY = 'diet_tracker_v1_data';
const LEGACY_GOAL_KEY = 'diet_tracker_v1_goal';
const MIGRATION_KEY = 'diet_tracker_migration_complete';

export const storage = {
    migrateLegacyData: (userId) => {
        // Only run if not already done
        if (localStorage.getItem(MIGRATION_KEY)) return;

        const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
        const legacyGoal = localStorage.getItem(LEGACY_GOAL_KEY);

        if (legacyData || legacyGoal) {
            if (legacyData) {
                localStorage.setItem(`diet_tracker_data_${userId}`, legacyData);
            }
            if (legacyGoal) {
                localStorage.setItem(`diet_tracker_goal_${userId}`, legacyGoal);
            }
            // Mark as complete so no other user gets this data
            localStorage.setItem(MIGRATION_KEY, 'true');
            console.log(`Migrated legacy data to user ${userId}`);
        }
    },

    getEntries: (userId) => {
        if (!userId) return {};
        try {
            const data = localStorage.getItem(`diet_tracker_data_${userId}`);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Failed to parse storage', e);
            return {};
        }
    },

    saveEntries: (entries, userId) => {
        if (!userId) {
            console.error('CRITICAL: saveEntries called without userId');
            return;
        }
        localStorage.setItem(`diet_tracker_data_${userId}`, JSON.stringify(entries));
    },

    getGoal: (userId) => {
        if (!userId) return null;
        try {
            const data = localStorage.getItem(`diet_tracker_goal_${userId}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    saveGoal: (goalData, userId) => {
        if (!userId) {
            console.error('CRITICAL: saveGoal called without userId');
            return;
        }
        localStorage.setItem(`diet_tracker_goal_${userId}`, JSON.stringify(goalData));
    },

    getAllEntries: (userId) => {
        const entries = storage.getEntries(userId);
        return Object.keys(entries)
            .sort((a, b) => new Date(b) - new Date(a)) // Newest first
            .map(date => ({
                date,
                ...entries[date]
            }));
    },

    saveEntry: (dateStr, entryData, userId) => {
        if (!userId) {
            console.error('CRITICAL: saveEntry called without userId');
            return;
        }
        const entries = storage.getEntries(userId);
        entries[dateStr] = { ...entryData, last_updated: new Date().toISOString() };
        storage.saveEntries(entries, userId);
    },

    deleteEntry: (dateStr, userId) => {
        if (!userId) {
            console.error('CRITICAL: deleteEntry called without userId');
            return;
        }
        const entries = storage.getEntries(userId);
        if (entries[dateStr]) {
            delete entries[dateStr];
            storage.saveEntries(entries, userId);
        }
    }
};
