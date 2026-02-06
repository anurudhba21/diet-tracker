import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
// We still use localstorage for SESSION token/user persistence on client side for now 
// but auth actions go to server.
// Actually, let's keep a simple session mechanism in localStorage to persist login state across reloads.
const SESSION_KEY = 'diet_tracker_current_session'; // Keeping purely for optimisic UI if needed, but primary auth is now backend

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initSession = async () => {
            try {
                // Check backend for valid session
                const user = await api.getSession();
                if (user) {
                    setUser(user);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                setLoading(false);
            }
        };
        initSession();
    }, []);

    const login = async (email, password) => {
        const user = await api.login(email, password);
        setUser(user);
        return user;
    };

    const register = async (userData) => {
        const user = await api.register(userData);
        setUser(user);
        return user;
    };

    const updateProfile = async (updates) => {
        if (!user) return;
        const updatedUser = await api.updateUser(user.id, updates);
        setUser(updatedUser);
        return updatedUser;
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
        window.location.href = '/login';
    };

    const requestOTP = async (phone) => {
        return await api.requestOTP(phone);
    };

    const loginWithPhone = async (phone, code) => {
        const user = await api.verifyOTP(phone, code);
        setUser(user);
        return user;
    };

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem',
                color: '#10b981'
            }}>
                <div className="ambient-orb orb-1" style={{ width: '20vh', height: '20vh', left: 'calc(50% - 10vh)', top: 'calc(50% - 10vh)' }}></div>
                <div style={{ zIndex: 1, fontWeight: 500 }}>Loading diet tracker...</div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, register, updateProfile, logout, requestOTP, loginWithPhone }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
