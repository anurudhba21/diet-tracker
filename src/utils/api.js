const API_URL = '/api';

export const api = {
    // Auth
    register: async (userData) => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMsg = `Server error: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMsg = errorJson.error || errorMsg;
            } catch (e) {
                // Not JSON, use status
            }
            throw new Error(errorMsg);
        }

        return await response.json().then(data => data.user);
    },

    login: async (email, password) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMsg = `Login failed: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMsg = errorJson.error || errorMsg;
            } catch (e) {
                // Not JSON
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        return data.user;
    },

    updateUser: async (userId, updates) => {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data.user;
    },

    // Entries
    getEntries: async (userId) => {
        const response = await fetch(`${API_URL}/entries?userId=${userId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data; // Returns array, may need conversion to map for frontend legacy logic
    },

    saveEntry: async (entryData) => {
        const response = await fetch(`${API_URL}/entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryData)
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error);
        }
        return await response.json();
    },

    deleteEntry: async (id) => {
        const response = await fetch(`${API_URL}/entries/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Status ${response.status}` }));
            throw new Error(errorData.error || 'Failed to delete');
        }
        return await response.json();
    },

    // Goal
    getGoal: async (userId) => {
        const response = await fetch(`${API_URL}/goal?userId=${userId}`);
        const data = await response.json();
        if (!response.ok) return null; // No goal yet
        // Map snake_case to camelCase
        if (!data) return null;
        return {
            startWeight: data.start_weight,
            targetWeight: data.target_weight,
            startDate: data.start_date
        };
    },

    saveGoal: async (goalData) => {
        const response = await fetch(`${API_URL}/goal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData)
        });
        if (!response.ok) throw new Error('Failed to save goal');
        return await response.json();
    }
};
