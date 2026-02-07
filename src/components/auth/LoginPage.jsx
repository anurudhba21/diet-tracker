import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage({ onNavigateRegister }) {
    const { login, loginWithPhone, requestOTP } = useAuth();
    const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
    const [step, setStep] = useState('phone-input'); // 'phone-input' or 'otp-verify'

    // Email State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Phone State
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const navigate = useNavigate();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await requestOTP(phone);
            setSuccessMsg(res.message || 'OTP sent!');
            setStep('otp-verify');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await loginWithPhone(phone, code);
            navigate('/');
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
                            <LogIn size={32} />
                        </div>
                        <h2 className="text-gradient" style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {authMethod === 'email' ? 'Sign in with Email' : 'Sign in with Phone'}
                        </p>
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

                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: '#10b981',
                                padding: '12px',
                                borderRadius: '12px',
                                marginBottom: '20px',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}
                        >
                            <span>✅</span> {successMsg}
                        </motion.div>
                    )}

                    {/* Toggle Auth Method */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                        <button
                            type="button"
                            onClick={() => { setAuthMethod('email'); setError(''); setSuccessMsg(''); }}
                            className={`btn ${authMethod === 'email' ? '' : 'btn-outline'}`}
                            style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
                        >
                            Email
                        </button>
                        <button
                            type="button"
                            onClick={() => { setAuthMethod('phone'); setError(''); setSuccessMsg(''); }}
                            className={`btn ${authMethod === 'phone' ? '' : 'btn-outline'}`}
                            style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
                        >
                            Phone
                        </button>
                    </div>

                    {authMethod === 'email' ? (
                        <form onSubmit={handleEmailLogin}>
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
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                className="btn"
                                style={{ marginTop: '8px' }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        Log In <ArrowRight size={18} />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    ) : (
                        <form onSubmit={step === 'phone-input' ? handleSendOTP : handleVerifyOTP}>
                            {step === 'phone-input' ? (
                                <div className="input-group">
                                    <label className="input-label">Phone Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                        <input
                                            type="tel"
                                            className="input-field"
                                            style={{ paddingLeft: '44px' }}
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="1234567890"
                                            required
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="input-group">
                                    <label className="input-label">Enter OTP</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                        <input
                                            type="text"
                                            className="input-field"
                                            style={{ paddingLeft: '44px' }}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            placeholder="Enter 6-digit code"
                                            required
                                        />
                                    </div>
                                    <div style={{ textAlign: 'right', marginTop: '8px' }}>
                                        <button type="button" onClick={() => setStep('phone-input')} style={{ background: 'none', border: 'none', color: 'var(--primary-500)', cursor: 'pointer', fontSize: '0.85rem' }}>Change Phone Number</button>
                                    </div>
                                </div>
                            )}

                            <motion.button
                                type="submit"
                                className="btn"
                                style={{ marginTop: '8px' }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        {step === 'phone-input' ? 'Send Code' : 'Verify & Login'} <ArrowRight size={18} />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    )}

                    <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Don't have an account?{' '}
                        <button
                            onClick={onNavigateRegister}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary-500)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                padding: '4px'
                            }}
                        >
                            Register
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
