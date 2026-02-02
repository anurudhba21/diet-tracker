export default function NotesInput({ value, onChange }) {
    return (
        <div className="card">
            <h3 className="input-label">Notes</h3>
            <textarea
                className="input-field"
                rows="3"
                placeholder="How do you feel today?"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                style={{ resize: 'vertical' }}
            />
        </div>
    );
}
