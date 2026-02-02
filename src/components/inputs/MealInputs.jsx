const MEALS = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'mid_snack', label: 'Mid Snack' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'evening', label: 'Evening' },
    { id: 'dinner', label: 'Dinner' }
];

export default function MealInputs({ data, onChange }) {
    const handleChange = (mealId, value) => {
        onChange(mealId, value);
    };

    return (
        <div className="card">
            <h3 className="input-label" style={{ marginBottom: 'var(--space-3)' }}>Meals</h3>
            {MEALS.map((meal) => (
                <div key={meal.id} className="input-group">
                    <label className="input-label" htmlFor={meal.id}>
                        {meal.label}
                    </label>
                    <input
                        id={meal.id}
                        type="text"
                        className="input-field"
                        placeholder={`What did you have for ${meal.label.toLowerCase()}?`}
                        value={data[meal.id] || ''}
                        onChange={(e) => handleChange(meal.id, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
}
