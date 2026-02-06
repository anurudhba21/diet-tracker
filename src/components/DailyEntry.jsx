import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDailyEntry } from '../hooks/useDailyEntry';
import WeightInput from './inputs/WeightInput';
import MealInputs from './inputs/MealInputs';
import HabitToggles from './inputs/HabitToggles';
import NotesInput from './inputs/NotesInput';
import confetti from 'canvas-confetti';
import { CheckCircle, Edit2 } from 'lucide-react';

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

    const { entry, updateEntry, saveEntry: saveToStorage, deleteEntry, isSaved, hasExistingData } = useDailyEntry(selectedDate);

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
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '60vh', justifyContent: 'center' }}>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)', width: '100%' }}>
                    <div style={{ color: 'var(--color-primary)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                        <CheckCircle size={64} />
                    </div>
                    <h2 style={{ marginBottom: '8px' }}>All Set!</h2>
                    <p className="text-muted" style={{ marginBottom: '24px' }}>
                        You've tracked your progress for {new Date(selectedDate).toDateString()}.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: '12px' }}>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Weight</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{entry.weight} kg</div>
                        </div>
                        <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: '12px' }}>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Habits</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                {['buttermilk_flag', 'omega3_flag'].filter(k => entry[k]).length}/2
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', background: entry.junk_flag ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${entry.junk_flag ? 'var(--color-danger)' : 'var(--color-primary)'}` }}>
                        <span style={{ fontSize: '1.2rem' }}>{entry.junk_flag ? '🍔' : '🥗'}</span>
                        <span style={{ fontWeight: 'bold', color: entry.junk_flag ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                            {entry.junk_flag ? 'Junk Food Eaten' : 'No Junk Food!'}
                        </span>
                    </div>

                    <button
                        className="btn"
                        onClick={() => setIsEditing(true)}
                        style={{ width: '100%', background: 'var(--color-surface)', color: 'var(--color-primary)', border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <Edit2 size={18} /> Edit Entry
                    </button>

                    {/* Allow changing date even from summary */}
                    <div style={{ marginTop: '20px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginRight: '8px' }}>View another day:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            max={todayStr}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '80px' }}>
            <div className="card" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
                <span style={{ fontWeight: 600 }}>Tracking for:</span>
                <input
                    type="date"
                    value={selectedDate}
                    max={todayStr}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-field"
                    style={{ width: 'auto', padding: '6px 10px', margin: 0, height: 'auto' }}
                />
            </div>

            {!isToday && (
                <div className="card" style={{
                    background: '#f1f5f9',
                    textAlign: 'center',
                    padding: 'var(--space-2)',
                    marginBottom: 'var(--space-4)'
                }}>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}> // Use slate-500 explicitly as text-muted might vary
                        You are editing a past entry for <b>{new Date(selectedDate).toDateString()}</b>.
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

            <MealInputs
                data={entry}
                onChange={handleMealChange}
                errors={errors}
            />

            {/* Junk Food Section */}
            <div className="card" style={{ borderLeft: `4px solid ${entry.junk_flag ? 'var(--color-danger)' : 'var(--color-primary)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 className="input-label" style={{ margin: 0 }}>Junk Food</h3>
                        <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>Did you consume any junk food today?</p>
                    </div>
                    <button
                        className="btn"
                        style={{
                            width: 'auto',
                            padding: 'var(--space-2) var(--space-4)',
                            backgroundColor: entry.junk_flag ? 'var(--color-danger)' : 'var(--color-border)',
                            color: entry.junk_flag ? 'white' : 'var(--color-text)',
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => updateEntry({ junk_flag: !entry.junk_flag })}
                    >
                        {entry.junk_flag ? 'YES 🍔' : 'NO 🥗'}
                    </button>
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
                marginTop: 'var(--space-6)',
                display: 'flex',
                gap: 'var(--space-2)'
            }}>
                {hasExistingData && (
                    <button
                        className="btn"
                        onClick={() => {
                            if (deleteEntry()) {
                                window.dispatchEvent(new CustomEvent('entry-deleted'));
                            }
                        }}
                        style={{
                            backgroundColor: 'var(--color-danger)',
                            flex: 1
                        }}
                    >
                        Delete
                    </button>
                )}
                <button
                    className="btn"
                    onClick={saveEntry}
                    style={{
                        backgroundColor: isSaved ? 'var(--color-primary-dark)' : 'var(--color-primary)',
                        flex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {isSaved ? 'Saved!' : 'Save Entry'}
                </button>
            </div>
        </div>
    );
}
