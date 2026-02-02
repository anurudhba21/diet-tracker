export default function WeightInput({ value, onChange }) {
    const handleChange = (e) => {
        const val = e.target.value;
        onChange(val);
    };

    return (
        <div className="card">
            <h3 className="input-label">Morning Weight (kg)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    placeholder="0.0"
                    value={value || ''}
                    onChange={handleChange}
                    style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                />
                <span style={{ fontSize: '1.2rem', color: 'var(--space-muted)' }}>kg</span>
            </div>
        </div>
    );
}
