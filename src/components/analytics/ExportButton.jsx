import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { exportService } from '../../utils/exportService';

export default function ExportButton() {
    const { user } = useAuth();

    const handleExport = async () => {
        if (!user) return;

        try {
            const entriesArr = await api.getEntries(user.id);
            const goal = await api.getGoal(user.id);

            if (!entriesArr || entriesArr.length === 0) {
                alert("No data to export yet!");
                return;
            }

            // Convert array to map and flatten for export service compatibility
            const entriesMap = {};
            entriesArr.forEach(e => {
                entriesMap[e.date] = {
                    ...e,
                    ...e.meals,
                    junk_flag: e.habits?.['Junk Food'],
                    buttermilk_flag: e.habits?.['Buttermilk'],
                    omega3_flag: e.habits?.['Omega-3']
                };
            });

            exportService.generateExcel(entriesMap, goal);
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
