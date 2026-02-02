import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';
import { exportService } from '../../utils/exportService';

export default function ExportButton() {
    const { user } = useAuth();
    const handleExport = () => {
        if (!user) return;
        const entries = storage.getEntries(user.id);
        const goal = storage.getGoal(user.id);

        if (Object.keys(entries).length === 0) {
            alert("No data to export yet!");
            return;
        }

        try {
            exportService.generateExcel(entries, goal);
        } catch (e) {
            console.error(e);
            alert("Failed to export data. See console for details.");
        }
    };

    return (
        <button
            onClick={handleExport}
            className="btn"
            style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                width: 'auto',
                padding: 'var(--space-2) var(--space-3)'
            }}
        >
            📂 Export Data
        </button>
    );
}
