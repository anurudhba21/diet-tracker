import { useState } from 'react';
import { api } from '../../utils/api';
import { Sparkles, Loader2, Info } from 'lucide-react';

const MEALS = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'mid_snack', label: 'Mid Snack' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'evening', label: 'Evening' },
    { id: 'dinner', label: 'Dinner' }
];

const MealInputRow = ({ meal, value, onChange, error }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [aiError, setAiError] = useState(null);

    const handleAnalyze = async () => {
        if (!value || value.trim().length < 3) return;

        setAnalyzing(true);
        setAiError(null);
        try {
            const result = await api.analyzeMeal(value);
            setAnalysis(result);
        } catch (err) {
            setAiError(err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div key={meal.id} className="input-group" style={{ marginBottom: '24px' }}>
            <label className="input-label" htmlFor={meal.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                    {meal.label} {error && <span style={{ color: 'var(--color-danger)', marginLeft: '4px' }}>*</span>}
                </span>
                {value && value.trim().length > 2 && (
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            padding: 0
                        }}
                    >
                        {analyzing ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                        {analyzing ? 'Analyzing...' : 'Analyze'}
                    </button>
                )}
            </label>
            <input
                id={meal.id}
                type="text"
                className="input-field"
                style={error ? { borderColor: 'var(--color-danger)', boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)' } : {}}
                placeholder={`What did you have for ${meal.label.toLowerCase()}?`}
                value={value || ''}
                onChange={(e) => onChange(meal.id, e.target.value)}
            />

            {/* AI Analysis Result */}
            {analysis && (
                <div style={{
                    marginTop: '8px',
                    background: 'var(--color-bg)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: '1px solid var(--color-border)'
                }}>
                    <div style={{ color: '#ef4444', fontWeight: '600' }}>🔥 {analysis.calories} kcal</div>
                    <div style={{ color: '#3b82f6', fontWeight: '600' }}>💪 {analysis.protein}</div>
                    <div style={{ color: 'var(--color-text-muted)', flex: 1, textAlign: 'right', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {analysis.short_summary}
                    </div>
                </div>
            )}

            {aiError && (
                <div style={{ marginTop: '4px', fontSize: '0.8rem', color: 'var(--color-danger)' }}>
                    {aiError.startsWith('AI Error') ? aiError : `Server says: ${aiError}`}
                </div>
            )}
        </div>
    );
};

export default function MealInputs({ data, onChange, errors = {} }) {
    const handleChange = (mealId, value) => {
        onChange(mealId, value);
    };

    return (
        <div className="card">
            <h3 className="input-label" style={{ marginBottom: 'var(--space-3)' }}>Meals</h3>
            {MEALS.map((meal) => (
                <MealInputRow
                    key={meal.id}
                    meal={meal}
                    value={data[meal.id]}
                    onChange={handleChange}
                    error={errors[meal.id]}
                />
            ))}
        </div>
    );
}
