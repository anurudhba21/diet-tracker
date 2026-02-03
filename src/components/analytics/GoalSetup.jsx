import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function GoalSetup({ onSave }) {
    const { user } = useAuth();
    const [startWeight, setStartWeight] = useState('');
    const [targetWeight, setTargetWeight] = useState('');

    const handleSave = () => {
        if (!startWeight || !targetWeight) {
            alert('Please fill in both fields');
            return;
        }
        const goalData = {
            startWeight: parseFloat(startWeight),
            targetWeight: parseFloat(targetWeight),
            updatedAt: new Date().toISOString()
        };
        // Bubble up to parent (Dashboard) which calls API
        onSave(goalData);
    };

    return (
        <div className="card">
            <h2 style={{ marginBottom: 'var(--space-4)' }}>Set Your Goal 🎯</h2>

            <div className="input-group">
                <label className="input-label">Starting Weight (kg)</label>
                <input
                    type="number"
                    className="input-field"
                    value={startWeight}
                    onChange={(e) => setStartWeight(e.target.value)}
                    placeholder="e.g. 85.0"
                />
            </div>

            <div className="input-group">
                <label className="input-label">Target Weight (kg)</label>
                <input
                    type="number"
                    className="input-field"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    placeholder="e.g. 75.0"
                />
            </div>

            <button className="btn" onClick={handleSave}>
                Save Goal
            </button>
        </div>
    );
}
