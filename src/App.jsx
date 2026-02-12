import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import MealPage from './components/MealPage'
import History from './components/History'
import ProgressPage from './components/analytics/ProgressPage'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import OnboardingPage from './components/auth/OnboardingPage'
import PrivacyPolicy from './components/legal/PrivacyPolicy'
import TermsOfService from './components/legal/TermsOfService'
import NavButton from './components/NavButton'
import PageTransition from './components/PageTransition'
import WorkoutPage from './components/workouts/WorkoutPage'
import { Soup, LayoutDashboard, Dumbbell } from 'lucide-react'
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';
import Chatbot from './components/chat/Chatbot';

// Wrapper to ensure we have a user (which AuthContext guarantees after loading)
function RequireUser({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg, #0f172a)',
                color: 'var(--color-text, #f8fafc)'
            }}>
                <div className="loader">Loading App...</div>
            </div>
        );
    }

    // Allow access to public paths without user
    const publicPaths = ['/login', '/register', '/privacy', '/terms'];
    if (publicPaths.includes(location.pathname)) {
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

    useEffect(() => {
        const initNative = async () => {
            if (Capacitor.isNativePlatform()) {
                try {
                    await StatusBar.setStyle({ style: Style.Dark });
                    await StatusBar.setOverlaysWebView({ overlay: true });
                } catch (e) {
                    console.warn('Status bar not available', e);
                }

                CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                    if (!canGoBack) {
                        CapacitorApp.minimizeApp();
                    } else {
                        window.history.back();
                    }
                });
            }
        };
        initNative();
    }, []);

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
                    <Route
                        path="/privacy"
                        element={
                            <PageTransition>
                                <PrivacyPolicy />
                            </PageTransition>
                        }
                    />
                    <Route
                        path="/terms"
                        element={
                            <PageTransition>
                                <TermsOfService />
                            </PageTransition>
                        }
                    />

                    <Route path="*" element={
                        <ThemeProvider>
                            <Layout>
                                <Routes location={location}>
                                    <Route path="/" element={
                                        <PageTransition><MealPage /></PageTransition>
                                    } />
                                    <Route path="/meals" element={
                                        <PageTransition><MealPage /></PageTransition>
                                    } />
                                    <Route path="/workouts" element={
                                        <PageTransition><WorkoutPage /></PageTransition>
                                    } />
                                    <Route path="/entry/:dateStr" element={
                                        <PageTransition><MealPage /></PageTransition>
                                    } />
                                    <Route path="/analytics" element={
                                        <PageTransition><ProgressPage /></PageTransition>
                                    } />
                                    {/* Onboarding can be a focused modal or route if editing profile */}
                                    <Route path="/profile" element={
                                        <PageTransition><OnboardingPage /></PageTransition>
                                    } />
                                </Routes>

                                {/* Navigation Bar */}
                                <nav className="nav-island">
                                    <NavButton icon={Soup} label="Meals" to="/" />
                                    <NavButton icon={Dumbbell} label="Workouts" to="/workouts" />
                                    <NavButton icon={LayoutDashboard} label="Progress" to="/analytics" />
                                </nav>

                                <Chatbot />
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
