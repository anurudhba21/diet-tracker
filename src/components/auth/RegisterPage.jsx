import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, UserPlus, ArrowRight, Loader2, Phone } from 'lucide-react';

export default function RegisterPage({ onNavigateLogin }) {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            setIsLoading(false);
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setIsLoading(false);
            return;
        }

        try {
            await register({ email, phone, password });
            // Success! Navigate to Onboarding (Profile)
            navigate('/profile');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="ambient-bg">
                <div className="orb orb-primary" />
                <div className="orb orb-accent" />
            </div>

            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                position: 'relative'
            }}>
                <motion.div
                    className="glass-panel"
                    style={{ width: '100%', maxWidth: '400px' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'var(--primary-glow)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            color: 'var(--primary-500)',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <UserPlus size={32} />
                        </div>
                        <h2 className="text-gradient" style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Start your journey today</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                padding: '12px',
                                borderRadius: '12px',
                                marginBottom: '20px',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}
                        >
                            <span>⚠️</span> {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                <input
                                    type="email"
                                    className="input-field"
                                    style={{ paddingLeft: '44px' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                <input
                                    type="password"
                                    className="input-field"
                                    style={{ paddingLeft: '44px' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                <input
                                    type="password"
                                    className="input-field"
                                    style={{ paddingLeft: '44px' }}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat password"
                                    required
                                />
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            className="btn"
                            style={{ marginTop: '12px' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    Create Account <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Already have an account?{' '}
                        <button
                            onClick={onNavigateLogin}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary-500)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                padding: '4px'
                            }}
                        >
                            Log In
                        </button>
                    </p>
                </motion.div>

                <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.7 }}>
                    <a href="/privacy" style={{ color: 'inherit', marginRight: '15px' }}>Privacy Policy</a>
                    <a href="/terms" style={{ color: 'inherit' }}>Terms of Service</a>
                </div>

            </div>
        </>
    );
}
