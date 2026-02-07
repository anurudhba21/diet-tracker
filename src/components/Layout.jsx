import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { getAvatarById } from '../utils/avatars';

export default function Layout({ children }) {
    const { theme, toggleTheme } = useTheme();
    const [showMenu, setShowMenu] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const avatar = getAvatarById(user?.avatar_id);

    const handleLogout = () => {
        if (confirm("Are you sure you want to log out?")) {
            logout();
        }
    };

    return (
        <>
            <div className="ambient-bg">
                <div className="orb orb-primary" />
                <div className="orb orb-accent" />
            </div>

            <div className="container">
                <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ position: 'relative' }}>
                        <button
                            className="avatar-btn"
                            onClick={() => setShowMenu(!showMenu)}
                            style={{
                                background: avatar.bgColor,
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                border: '2px solid var(--glass-border)',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {avatar.emoji}
                        </button>

                        {showMenu && (
                            <div className="glass-panel" style={{
                                position: 'absolute',
                                top: '120%',
                                left: 0,
                                width: '200px',
                                padding: '12px',
                                zIndex: 1000,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                <button
                                    className="btn-ghost"
                                    onClick={() => navigate('/profile')}
                                    style={{ justifyContent: 'flex-start', width: '100%' }}
                                >
                                    My Profile
                                </button>
                                <button
                                    className="btn-ghost"
                                    onClick={handleLogout}
                                    style={{ color: 'var(--danger)', justifyContent: 'flex-start', width: '100%' }}
                                >
                                    <LogOut size={16} style={{ marginRight: '8px' }} />
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>

                    <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }} className="text-gradient">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h1>

                    <button
                        onClick={toggleTheme}
                        className="btn-ghost"
                        style={{ borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    >
                        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                </header>

                <main style={{ paddingBottom: '100px' }}>
                    {children}
                </main>
            </div>
        </>
    )
}
