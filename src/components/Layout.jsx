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
            <div className="ambient-orb orb-1" />
            <div className="ambient-orb orb-2" />

            <div className="container">
                <header className="app-header" style={{ position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                        <button
                            className="avatar-btn"
                            onClick={() => setShowMenu(!showMenu)}
                            title="Account Options"
                            style={{
                                background: avatar.bgColor,
                                fontSize: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                border: '2px solid var(--color-primary)'
                            }}
                        >
                            {avatar.emoji}
                        </button>

                        {showMenu && (
                            <div className="card" style={{
                                position: 'absolute',
                                top: '120%',
                                left: 0,
                                width: '180px',
                                padding: '8px',
                                zIndex: 1000,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}>
                                <button
                                    className="btn"
                                    onClick={() => navigate('/profile')}
                                    style={{ fontSize: '0.9rem', padding: '8px', background: 'transparent', color: 'var(--color-text)', justifyContent: 'flex-start' }}
                                >
                                    My Profile
                                </button>
                                <button
                                    className="btn"
                                    onClick={handleLogout}
                                    style={{ fontSize: '0.9rem', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', justifyContent: 'flex-start' }}
                                >
                                    <LogOut size={16} style={{ marginRight: '8px' }} />
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>

                    <h1 style={{ fontSize: '1.25rem', margin: 0 }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h1>

                    <button
                        onClick={toggleTheme}
                        className="avatar-btn"
                        style={{ background: 'transparent', border: '1px solid var(--color-border)' }}
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </header>

                <main style={{ paddingBottom: '20px' }}>
                    {children}
                </main>
            </div>
        </>
    )
}
