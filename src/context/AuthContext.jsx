import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../utils/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sessionUser = authService.getSession();
        if (sessionUser) {
            setUser(sessionUser);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const user = await authService.login(email, password);
        setUser({ id: user.id, email: user.email });
        return user;
    };

    const register = async (email, password) => {
        const user = await authService.register(email, password);
        setUser({ id: user.id, email: user.email });
        return user;
    };

    const updateProfile = (updates) => {
        if (!user) return;
        const updatedUser = authService.updateUser(user.id, updates);
        setUser(updatedUser);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
