import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { storage } from './utils/storage'
import Layout from './components/Layout'
import DailyEntry from './components/DailyEntry'
import History from './components/History'
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import ErrorBoundary from './components/ErrorBoundary'

import { Calendar, History as HistoryIcon, BarChart2, Edit2, LogOut } from 'lucide-react';

function AuthenticatedApp() {
    const { user, logout } = useAuth();
    const [view, setView] = useState('today');
    const [targetDate, setTargetDate] = useState(new Date().toDateString());

    useEffect(() => {
        if (user) {
            storage.migrateLegacyData(user.id);
        }
    }, [user]);

    useEffect(() => {
        const handleEntryDeleted = () => setView('history');
        window.addEventListener('entry-deleted', handleEntryDeleted);
        return () => window.removeEventListener('entry-deleted', handleEntryDeleted);
    }, []);

    const goHome = () => { setView('today'); setTargetDate(new Date().toDateString()); };
    const goHistory = () => setView('history');
    const goAnalytics = () => setView('analytics');
    const handleEdit = (date) => { setTargetDate(date); setView('edit'); };

    return (
        <Layout>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                    {view === 'today' ? 'Daily Tracker' : view === 'history' ? 'History' : 'Stats & Goals'}
                </h1>
                <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                    <LogOut size={20} />
                </button>
            </div>

            {/* Content Area with Animation Wrapper (Handled inside components or here) */}
            <div style={{ paddingBottom: '80px' }}> {/* Space for bottom nav */}
                {view === 'history' ? <History key="hi" onSelectDate={handleEdit} /> :
                    view === 'analytics' ? <AnalyticsDashboard key="an" /> :
                        <DailyEntry key={targetDate} date={targetDate} />}
            </div>

            {/* Bottom Navigation Bar */}
            <div style={{
                position: 'fixed',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '400px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                borderRadius: '2rem',
                border: '1px solid rgba(255,255,255,0.5)',
                display: 'flex',
                justifyContent: 'space-around',
                padding: '0.75rem',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                zIndex: 100
            }}>
                <NavButton active={view === 'today'} onClick={goHome} icon={<Edit2 size={24} />} label="Today" />
                <NavButton active={view === 'history'} onClick={goHistory} icon={<HistoryIcon size={24} />} label="History" />
                <NavButton active={view === 'analytics'} onClick={goAnalytics} icon={<BarChart2 size={24} />} label="Stats" />
            </div>
        </Layout>
    );
}

// Internal component for cleaner code
function NavButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: active ? 'var(--color-primary)' : 'transparent',
                color: active ? 'white' : 'var(--color-text-muted)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            {icon}
        </button>
    );
}

function AppContent() {
    const { user } = useAuth();
    const [authView, setAuthView] = useState('login'); // 'login' | 'register'

    if (user) return <AuthenticatedApp />;

    if (authView === 'register') {
        return <RegisterPage onNavigateLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onNavigateRegister={() => setAuthView('register')} />;
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App
