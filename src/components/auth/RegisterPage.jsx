import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage({ onNavigateLogin }) {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            await register(email, password);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>Create Account 🚀</h2>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 chars"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%' }}>
                        Register
                    </button>
                </form>

                <p style={{ marginTop: '16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Already have an account?{' '}
                    <button
                        onClick={onNavigateLogin}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Log In
                    </button>
                </p>
            </div>
        </div>
    );
}
