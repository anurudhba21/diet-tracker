import { useDailyEntry } from '../hooks/useDailyEntry';
import WeightInput from './inputs/WeightInput';
import MealInputs from './inputs/MealInputs';
import HabitToggles from './inputs/HabitToggles';
import NotesInput from './inputs/NotesInput';
import confetti from 'canvas-confetti';

export default function DailyEntry({ date }) {
    const { entry, updateEntry, saveEntry: saveToStorage, deleteEntry, isSaved } = useDailyEntry(date);
    // Important: Compare by date string to avoid time issues
    const isToday = new Date(date).toDateString() === new Date().toDateString();

    const handleMealChange = (id, value) => {
        updateEntry({ [id]: value });
    };

    const handleHabitChange = (id, value) => {
        updateEntry({ [id]: value });
    };

    const saveEntry = () => {
        saveToStorage();
        if (!isSaved) { // Only burst if it wasn't already saved consecutively (though logic resets isSaved quickly)
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#3b82f6', '#f59e0b']
            });
        }
    };

    return (
        <div style={{ paddingBottom: '80px' }}>
            {!isToday && (
                <div className="card" style={{
                    background: '#f1f5f9',
                    textAlign: 'center',
                    padding: 'var(--space-2)'
                }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
                        Editing Past Entry: {new Date(date).toDateString()}
                    </p>
                </div>
            )}

            <WeightInput
                value={entry.weight}
                onChange={(val) => updateEntry({ weight: val })}
            />

            <MealInputs
                data={entry}
                onChange={handleMealChange}
            />

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
                {!isToday && (
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
