import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Activity } from 'lucide-react';
import AvatarPicker from '../common/AvatarPicker';
import { AVATARS } from '../../utils/avatars';
import { analytics } from '../../utils/analytics';
import confetti from 'canvas-confetti';

export default function OnboardingPage() {
    const { user, updateProfile, logout } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        height_cm: user?.height_cm || '',
        dob: user?.dob || '',
        gender: user?.gender || 'male',
        current_weight: '',
        age: '',
        avatar_id: user?.avatar_id || AVATARS[0].id,
        target_weight: ''
    });

    const [bmi, setBmi] = useState(null);

    // Calculate BMI in real-time
    useEffect(() => {
        if (formData.current_weight && formData.height_cm) {
            const calculated = analytics.calculateBMI(formData.current_weight, formData.height_cm);
            setBmi(calculated);
        } else {
            setBmi(null);
        }
    }, [formData.current_weight, formData.height_cm]);

    // Helper to calculate age from DOB
    const getAgeFromDob = (dobString) => {
        if (!dobString) return '';
        const birthDate = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age; // Return plain number
    };

    // Initialize Age from DOB if exists
    useEffect(() => {
        if (user?.dob) {
            setFormData(prev => ({ ...prev, age: getAgeFromDob(user.dob) }));
        }
    }, [user]);

    // Fetch latest weight and goal
    useEffect(() => {
        if (user?.id) {
            // 1. Fetch entries for current weight
            api.getEntries(user.id).then(entries => {
                const sorted = entries.sort((a, b) => new Date(b.date) - new Date(a.date));
                const latest = sorted.find(e => e.weight);
                if (latest) {
                    setFormData(prev => ({ ...prev, current_weight: latest.weight }));
                }
            });

            // 2. Fetch goal for target weight
            api.getGoal(user.id).then(goal => {
                if (goal) {
                    setFormData(prev => ({ ...prev, target_weight: goal.target_weight }));
                }
            });
        }
    }, [user]);

    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'age') {
            // When age changes, calculate approximate DOB
            const ageVal = parseInt(value);
            let approxDob = '';
            if (!isNaN(ageVal) && ageVal > 0) {
                const currentYear = new Date().getFullYear();
                const birthYear = currentYear - ageVal;
                // Default to Jan 1st of that year
                approxDob = `${birthYear}-01-01`;
            }
            setFormData({ ...formData, age: value, dob: approxDob });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.age || !formData.height_cm || !formData.current_weight) {
            // Basic check
        }

        try {
            const isFirstTime = !user?.name;

            // 1. Update User Profile
            await updateProfile({
                name: formData.name,
                phone: formData.phone,
                height_cm: Number(formData.height_cm),
                dob: formData.dob, // Sending the calculated DOB
                gender: formData.gender,
                avatar_id: formData.avatar_id
            });

            // 2. Save Current Weight as Today's Entry
            if (formData.current_weight) {
                const todayStr = new Date().toISOString().split('T')[0];
                await api.saveEntry({
                    userId: user.id,
                    date: todayStr,
                    weight: Number(formData.current_weight)
                });

                // 3. Save/Update Goal
                if (formData.target_weight) {
                    await api.saveGoal({
                        userId: user.id,
                        startWeight: Number(formData.current_weight),
                        targetWeight: Number(formData.target_weight),
                        startDate: todayStr
                    });
                }
            }

            if (isFirstTime) {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.7 },
                    colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
                });
                // Small delay to let confetti show before navigation if wanted, 
                // but navigate works fine as it stays on same site
            }

            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to log out?')) {
            logout();
        }
    }

    return (
        <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '450px', margin: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <h2 style={{ textAlign: 'center', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={24} /> My Profile
                    </h2>
                    <button
                        onClick={handleLogout}
                        style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}
                        type="button"
                    >
                        <LogOut size={16} /> Log Out
                    </button>
                </div>

                <p style={{ textAlign: 'center', marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
                    Setting up your health profile.
                </p>

                {/* BMI Display Card */}
                {bmi && (
                    <div className="card" style={{
                        background: 'var(--color-bg)',
                        border: `1px solid ${bmi.color}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        marginBottom: '20px',
                        gap: '4px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: bmi.color }}>
                            <Activity size={18} />
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current BMI</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800 }}>{bmi.value}</div>
                        <div style={{
                            padding: '2px 10px',
                            background: bmi.color,
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                        }}>
                            {bmi.category}
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    <div className="input-group">
                        <label className="input-label">Choose Your Avatar</label>
                        <AvatarPicker
                            selectedId={formData.avatar_id}
                            onSelect={(id) => setFormData({ ...formData, avatar_id: id })}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input
                            name="name"
                            type="text"
                            className="input-field"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="input-group">
                            <label className="input-label">Gender</label>
                            <select
                                name="gender"
                                className="input-field"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Age (Years)</label>
                            <input
                                name="age"
                                type="number"
                                className="input-field"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="25"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="input-group">
                            <label className="input-label">Height (cm)</label>
                            <input
                                name="height_cm"
                                type="number"
                                className="input-field"
                                value={formData.height_cm}
                                onChange={handleChange}
                                placeholder="175"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Weight (kg)</label>
                            <input
                                name="current_weight"
                                type="number"
                                step="0.1"
                                className="input-field"
                                value={formData.current_weight}
                                onChange={handleChange}
                                placeholder="70.5"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Phone Number</label>
                        <input
                            name="phone"
                            type="tel"
                            className="input-field"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 234 567 890"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Target Weight Goal (kg)</label>
                        <input
                            name="target_weight"
                            type="number"
                            step="0.1"
                            className="input-field"
                            value={formData.target_weight}
                            onChange={handleChange}
                            placeholder="e.g. 75.0"
                            required
                        />
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                            Setting a target helps us track your progress!
                        </p>
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>
                        Update Profile 🚀
                    </button>
                </form>
            </div>
        </div>
    );
}
