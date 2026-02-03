export default function WeightInput({ value, onChange, hasError }) {
    const handleChange = (e) => {
        const val = e.target.value;
        onChange(val);
    };

    return (
        <div className="card">
            <h3 className="input-label">Morning Weight (kg)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input
                    id="weight"
                    type="number"
                    step="0.1"
                    className="input-field"
                    placeholder="0.0"
                    value={value || ''}
                    onChange={handleChange}
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        ...(hasError ? { borderColor: 'var(--color-danger)', boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)' } : {})
                    }}
                />
                <span style={{ fontSize: '1.2rem', color: 'var(--space-muted)' }}>kg</span>
            </div>
        </div>
    );
}
