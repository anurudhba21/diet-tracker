const API_URL = '/api';

export const api = {
    // Auth
    register: async (userData) => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
            credentials: 'include'
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
            body: JSON.stringify({ email, password }),
            credentials: 'include'
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

    getSession: async () => {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                credentials: 'include'
            });
            if (!response.ok) return null;
            const data = await response.json();
            return data.user;
        } catch {
            return null;
        }
    },

    logout: async () => {
        await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
    },

    updateUser: async (userId, updates) => {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data.user;
    },

    // OTP
    requestOTP: async (phone) => {
        const response = await fetch(`${API_URL}/auth/otp/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
            credentials: 'include'
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error);
        }
        return await response.json();
    },

    verifyOTP: async (phone, code) => {
        const response = await fetch(`${API_URL}/auth/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code }),
            credentials: 'include'
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error);
        }
        return await response.json().then(data => data.user);
    },

    // Entries
    getEntries: async (userId) => {
        const response = await fetch(`${API_URL}/entries?userId=${userId}`, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
    },

    saveEntry: async (entryData) => {
        const response = await fetch(`${API_URL}/entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryData),
            credentials: 'include'
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error);
        }
        return await response.json();
    },

    deleteEntry: async (id) => {
        const response = await fetch(`${API_URL}/entries/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Status ${response.status}` }));
            throw new Error(errorData.error || 'Failed to delete');
        }
        return await response.json();
    },

    // Goal
    getGoal: async (userId) => {
        const response = await fetch(`${API_URL}/goal?userId=${userId}`, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) return null; // No goal yet
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
            body: JSON.stringify(goalData),
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to save goal');
        return await response.json();
    },


};
