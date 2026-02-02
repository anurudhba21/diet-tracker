const USERS_KEY = 'diet_tracker_users';
const SESSION_KEY = 'diet_tracker_current_session';

// Simple SHA-256 hash using Web Crypto API
async function hashPassword(password, salt) {
    const enc = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    // Derive key using PBKDF2
    // We use the salt (must be Uint8Array)
    const keyBuffer = await window.crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        passwordKey,
        256 // 256-bit key
    );

    // Convert to hex string for storage
    return Array.from(new Uint8Array(keyBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function hexToUint8Array(hexString) {
    return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

function uint8ArrayToHex(bytes) {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export const authService = {
    getUsers: () => {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        } catch { return []; }
    },

    register: async (email, password) => {
        const users = authService.getUsers();
        if (users.find(u => u.email === email)) {
            throw new Error('User already exists');
        }

        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const hash = await hashPassword(password, salt);

        const newUser = {
            id: crypto.randomUUID(),
            email,
            password_hash: hash,
            salt: uint8ArrayToHex(salt),
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Auto login
        authService.setSession(newUser);
        return newUser;
    },

    login: async (email, password) => {
        const users = authService.getUsers();
        const user = users.find(u => u.email === email);

        if (!user) throw new Error('Invalid credentials');

        const salt = hexToUint8Array(user.salt);
        const hash = await hashPassword(password, salt);

        if (hash !== user.password_hash) {
            throw new Error('Invalid credentials');
        }

        authService.setSession(user);
        return user;
    },

    logout: () => {
        localStorage.removeItem(SESSION_KEY);
    },

    setSession: (user) => {
        const session = {
            user: { ...user }, // Store full user object including height
            expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    },

    updateUser: (userId, updates) => {
        const users = authService.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) throw new Error('User not found');

        const updatedUser = { ...users[userIndex], ...updates };
        users[userIndex] = updatedUser;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Update session if it matches current user
        const currentSession = authService.getSession();
        if (currentSession && currentSession.id === userId) {
            authService.setSession(updatedUser);
        }
        return updatedUser;
    },

    getSession: () => {
        try {
            const session = JSON.parse(localStorage.getItem(SESSION_KEY));
            if (!session || new Date(session.expiry) < new Date()) {
                localStorage.removeItem(SESSION_KEY);
                return null;
            }
            return session.user;
        } catch {
            return null;
        }
    }
};
