import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDailyEntry } from '../hooks/useDailyEntry';
import WeightInput from './inputs/WeightInput';
import MealInputs from './inputs/MealInputs';
import HabitToggles from './inputs/HabitToggles';
import NotesInput from './inputs/NotesInput';
import confetti from 'canvas-confetti';
import { CheckCircle, Edit2, AlertTriangle } from 'lucide-react';
import { analytics } from '../utils/analytics';

export default function DailyEntry({ date }) {
    const { dateStr } = useParams();
    const navigate = useNavigate();

    // If no date is provided, use today.
    const todayStr = new Date().toISOString().split('T')[0];

    // Priority: Prop > URL Param > Today
    // We use a function to initialize state lazily or just direct value
    const initialDate = date || dateStr || todayStr;

    // If date prop changes (e.g. navigation), allow it to override local state
    const [selectedDate, setSelectedDate] = useState(initialDate);

    // Sync state if prop or param changes
    useEffect(() => {
        const target = date || dateStr;
        if (target) setSelectedDate(target);
    }, [date, dateStr]);

    // Update URL when date changes (optional but good for consistency)
    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
        // Optional: navigate to the new date URL to keep history consistent
        // navigate(/entry/${newDate}); 
    };

    const isToday = selectedDate === todayStr;

    const { entry, updateEntry, saveEntry: saveToStorage, deleteEntry, isSaved, hasExistingData, previousWeight } = useDailyEntry(selectedDate);

    // Default to editing if no data exists
    const [isEditing, setIsEditing] = useState(true);
    const [errors, setErrors] = useState({});

    // Safety check for entry
    if (!entry) {
        return <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>Loading...</div>;
    }

    // Sync editing state with data existence
    useEffect(() => {
        if (hasExistingData) {
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    }, [hasExistingData]);

    // Anomaly Detection
    const [anomaly, setAnomaly] = useState(null);
    useEffect(() => {
        if (entry.weight && previousWeight && isEditing) {
            const result = analytics.detectAnomaly(entry.weight, previousWeight);
            setAnomaly(result);
        } else {
            setAnomaly(null);
        }
    }, [entry.weight, previousWeight, isEditing]);

    const handleMealChange = (id, value) => {
        updateEntry({ [id]: value });
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleHabitChange = (id, value) => {
        updateEntry({ [id]: value });
    };

    const saveEntry = async () => {
        const result = await saveToStorage();
        if (result && result.success) {
            setErrors({});
            if (!isSaved) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10b981', '#3b82f6', '#f59e0b']
                });
            }
            // Switch to summary view after save
            setIsEditing(false);
        } else if (result && result.errors) {
            const newErrors = {};
            result.errors.forEach(err => newErrors[err] = true);
            setErrors(newErrors);

            const firstErrorId = result.errors[0];
            const element = document.getElementById(firstErrorId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            }
        }
    };

    // Summary View
    if (!isEditing && hasExistingData) {
        return (
            <div style={{ padding: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '50vh', justifyContent: 'center' }}>
                <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 24px', width: '100%', maxWidth: '400px' }}>
                    <div style={{
                        color: 'var(--primary-500)',
                        marginBottom: '24px',
                        display: 'flex',
                        justifyContent: 'center',
                        filter: 'drop-shadow(0 0 15px var(--primary-glow))'
                    }}>
                        <CheckCircle size={80} />
                    </div>
                    <h2 className="text-gradient" style={{ marginBottom: '8px', fontSize: '2rem' }}>All Set!</h2>
                    <p style={{ marginBottom: '32px', color: 'var(--text-muted)' }}>
                        You've tracked your progress for <br />
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{new Date(selectedDate).toDateString()}</span>
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>Weight</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{entry.weight} <span style={{ fontSize: '1rem' }}>kg</span></div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>Habits</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                {entry.habits ? Object.values(entry.habits).filter(Boolean).length : 0}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        marginBottom: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '16px',
                        borderRadius: '16px',
                        background: (entry.habits && entry.habits['Junk Food']) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        border: `1px solid ${(entry.habits && entry.habits['Junk Food']) ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>{(entry.habits && entry.habits['Junk Food']) ? '🍔' : '🥗'}</span>
                        <span style={{ fontWeight: 700, color: (entry.habits && entry.habits['Junk Food']) ? '#f87171' : '#34d399' }}>
                            {(entry.habits && entry.habits['Junk Food']) ? 'Junk Food Eaten' : 'Clean Eating!'}
                        </span>
                    </div>

                    <button
                        className="btn-ghost"
                        onClick={() => setIsEditing(true)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <Edit2 size={18} /> Edit Entry
                    </button>

                    {/* Allow changing date even from summary */}
                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>View another day:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            max={todayStr}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-main)',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '100px' }}>
            <div className="glass-panel" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Tracking for:</span>
                <input
                    type="date"
                    value={selectedDate}
                    max={todayStr}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-field"
                    style={{ width: 'auto', padding: '8px 12px', margin: 0, height: 'auto', fontSize: '0.9rem' }}
                />
            </div>

            {!isToday && (
                <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    textAlign: 'center',
                    padding: '12px',
                    marginBottom: '24px',
                    borderRadius: 'var(--radius-md)',
                    color: '#60a5fa'
                }}>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                        Values for <b>{new Date(selectedDate).toDateString()}</b>
                    </p>
                </div>
            )}

            <WeightInput
                value={entry.weight}
                onChange={(val) => {
                    updateEntry({ weight: val });
                    if (errors.weight) setErrors(prev => ({ ...prev, weight: false }));
                }}
                hasError={!!errors.weight}
            />

            {anomaly && (
                <div style={{
                    marginTop: '12px',
                    marginBottom: '24px',
                    padding: '12px',
                    background: anomaly.severity === 'high' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    border: `1px solid ${anomaly.severity === 'high' ? '#ef4444' : '#f59e0b'}`,
                    borderRadius: '12px',
                    color: anomaly.severity === 'high' ? '#fca5a5' : '#fcd34d',
                    display: 'flex',
                    alignItems: 'start',
                    gap: '12px',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <AlertTriangle size={20} style={{ minWidth: '20px', marginTop: '2px' }} />
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {anomaly.type === 'Sanity' ? 'Wait, is this right?' : 'Unusual Fluctuation'}
                        </div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{anomaly.message}</div>
                    </div>
                </div>
            )}

            <MealInputs
                data={entry}
                onChange={handleMealChange}
                errors={errors}
            />

            {/* Core Metrics Section */}
            <div style={{ marginBottom: '24px' }}>
                <h3 className="text-gradient" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Daily Check</h3>
                <div
                    onClick={() => updateEntry({ junk: !entry.junk })}
                    className="glass-panel"
                    style={{
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        border: entry.junk ? '1px solid var(--danger)' : '1px solid var(--glass-border)',
                        background: entry.junk ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            fontSize: '1.5rem',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            🍔
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, color: entry.junk ? '#f87171' : 'var(--text-main)' }}>
                                Junk Food
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {entry.junk ? 'Tracked as "Junk"' : 'Clean eating today?'}
                            </div>
                        </div>
                    </div>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        border: entry.junk ? 'none' : '2px solid var(--text-muted)',
                        background: entry.junk ? '#ef4444' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        {entry.junk && <CheckCircle size={16} />}
                    </div>
                </div>
            </div>

            <HabitToggles
                data={entry}
                onChange={handleHabitChange}
            />

            <NotesInput
                value={entry.notes}
                onChange={(val) => updateEntry({ notes: val })}
            />

            <div style={{
                marginTop: '32px',
                display: 'flex',
                gap: '12px'
            }}>
                {hasExistingData && (
                    <button
                        className="btn-ghost"
                        onClick={() => {
                            if (confirm('Delete this entry?')) {
                                deleteEntry();
                                window.dispatchEvent(new CustomEvent('entry-deleted'));
                            }
                        }}
                        style={{
                            color: 'var(--danger)',
                            flex: 1,
                            borderColor: 'rgba(239, 68, 68, 0.3)'
                        }}
                    >
                        Delete
                    </button>
                )}
                <button
                    className="btn"
                    onClick={saveEntry}
                    style={{
                        flex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: isSaved ? 'var(--primary-600)' : 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
                    }}
                >
                    {isSaved ? <CheckCircle size={18} /> : null}
                    {isSaved ? 'Saved!' : 'Save Entry'}
                </button>
            </div>
        </div>
    );
}
