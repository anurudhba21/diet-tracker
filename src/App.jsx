import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import DailyEntry from './components/DailyEntry'
import History from './components/History'
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import OnboardingPage from './components/auth/OnboardingPage'
import NavButton from './components/NavButton'
import PageTransition from './components/PageTransition'
import { Book, LayoutDashboard, PlusCircle } from 'lucide-react'

// Wrapper to ensure we have a user (which AuthContext guarantees after loading)
function RequireUser({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return null; // Or a spinner

    // Allow access to public paths without user
    if (location.pathname === '/login' || location.pathname === '/register') {
        return children;
    }

    if (!user) {
        // Redirect to login, but save the location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // New: Check if onboarding is complete
    const isOnboardingComplete = user.name && user.height_cm;
    if (!isOnboardingComplete && location.pathname !== '/profile') {
        // Force onboarding if profile is incomplete
        // We redirect to /profile (which uses OnboardingPage)
        return <Navigate to="/profile" replace />;
    }

    return children;
}

function AppContent() {
    const location = useLocation();

    return (
        <RequireUser>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route
                        path="/login"
                        element={
                            <PageTransition>
                                <LoginPage onNavigateRegister={() => window.location.href = '/register'} />
                            </PageTransition>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PageTransition>
                                <RegisterPage onNavigateLogin={() => window.location.href = '/login'} />
                            </PageTransition>
                        }
                    />

                    <Route path="*" element={
                        <ThemeProvider>
                            <Layout>
                                <Routes location={location}>
                                    <Route path="/" element={
                                        <PageTransition><DailyEntry /></PageTransition>
                                    } />
                                    <Route path="/history" element={
                                        <PageTransition><History /></PageTransition>
                                    } />
                                    <Route path="/entry/:dateStr" element={
                                        <PageTransition><DailyEntry /></PageTransition>
                                    } />
                                    <Route path="/analytics" element={
                                        <PageTransition><AnalyticsDashboard /></PageTransition>
                                    } />
                                    {/* Onboarding can be a focused modal or route if editing profile */}
                                    <Route path="/profile" element={
                                        <PageTransition><OnboardingPage /></PageTransition>
                                    } />
                                </Routes>

                                {/* Navigation Bar */}
                                <nav className="bottom-nav-container">
                                    <NavButton icon={PlusCircle} label="Track" to="/" active={location.pathname === '/' || location.pathname.startsWith('/entry')} />
                                    <NavButton icon={Book} label="History" to="/history" active={location.pathname === '/history'} />
                                    <NavButton icon={LayoutDashboard} label="Progress" to="/analytics" active={location.pathname === '/analytics'} />
                                </nav>
                            </Layout>
                        </ThemeProvider>
                    } />
                </Routes>
            </AnimatePresence>
        </RequireUser>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    )
}
