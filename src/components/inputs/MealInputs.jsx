import { useState } from 'react'; // Kept if needed, otherwise remove
import { api } from '../../utils/api';

const MEALS = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'mid_snack', label: 'Mid Snack' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'evening', label: 'Evening' },
    { id: 'dinner', label: 'Dinner' }
];

const MealInputRow = ({ meal, value, onChange, error }) => {
    return (
        <div key={meal.id} className="input-group" style={{ marginBottom: '16px' }}>
            <label className="input-label" htmlFor={meal.id}>
                {meal.label} {error && <span style={{ color: 'var(--color-danger)', marginLeft: '4px' }}>*</span>}
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
