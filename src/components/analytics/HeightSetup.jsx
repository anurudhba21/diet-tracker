import { useState } from 'react';

export default function HeightSetup({ onSave }) {
    const [height, setHeight] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const val = parseFloat(height);
        if (val > 50 && val < 300) {
            onSave(val);
        } else {
            alert('Please enter a valid height in cm (50-300)');
        }
    };

    return (
        <div className="card" style={{ marginBottom: 'var(--space-4)', borderLeft: '4px solid var(--color-primary)' }}>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>One Last Thing! 📏</h3>
            <p className="text-muted" style={{ marginBottom: 'var(--space-3)' }}>
                Enter your height to enable BMI tracking.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                    type="number"
                    placeholder="Height (cm)"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="input-field"
                    style={{ flex: 1 }}
                    autoFocus
                />
                <button type="submit" className="btn" style={{ width: 'auto' }}>
                    Save
                </button>
            </form>
        </div>
    );
}
