import * as XLSX from 'xlsx';
import { analytics } from './analytics';

export const exportService = {
    generateExcel: (entries, goal) => {
        // 1. Prepare Daily Tracking Data
        const sortedDates = Object.keys(entries).sort((a, b) => new Date(b) - new Date(a));

        // Scan for all unique habits across all entries to create dynamic columns
        const allHabitsSet = new Set();
        Object.values(entries).forEach(e => {
            if (e.habits) {
                Object.keys(e.habits).forEach(h => allHabitsSet.add(h));
            }
        });
        const habitColumns = Array.from(allHabitsSet).sort();

        const dailyRows = sortedDates.map(date => {
            const e = entries[date];

            // Base Row
            const row = {
                Date: date,
                Weight_kg: e.weight || '-',
                Breakfast: e.breakfast || '',
                Mid_Snack: e.mid_snack || '',
                Lunch: e.lunch || '',
                Evening: e.evening || '',
                Dinner: e.dinner || '',
                Junk_Food: (e.habits && e.habits['Junk Food']) ? 'Yes' : 'No', // Keep Junk explicit if desired, or dynamic
                Notes: e.notes || ''
            };

            // Add Dynamic Habit Columns
            habitColumns.forEach(habit => {
                if (habit !== 'Junk Food') { // Junk already handled
                    row[habit] = (e.habits && e.habits[habit]) ? 'Yes' : 'No';
                }
            });

            return row;
        });

        const worksheet1 = XLSX.utils.json_to_sheet(dailyRows);

        // 2. Prepare Goal Progress Data
        let goalRows = [];
        if (goal && entries) {
            // Sort dates ascending for progress tracking
            const ascDates = [...sortedDates].reverse();
            const startWeight = parseFloat(goal.startWeight);
            const targetWeight = parseFloat(goal.targetWeight);

            goalRows = ascDates.map((date, index) => {
                const entry = entries[date];
                const currentWeight = parseFloat(entry.weight);

                // Skip entries without weight for goal progress? 
                // Or include them with dashes? usually progress implies weight check.
                // Let's include them but show '-' if weight is missing, 
                // but calculations require weight. 

                if (isNaN(currentWeight)) return null;

                const stats = analytics.calculateProgress(goal, currentWeight);

                return {
                    Date: date,
                    "Streak Day": `Day ${index + 1}`,
                    "Morning Weight": currentWeight,
                    "Weight Lost": stats ? stats.lost : '-',
                    "Weight Remaining": stats ? stats.remaining : '-',
                    "% Goal Completed": stats ? `${stats.percent}%` : '-',
                    "Starting Weight": startWeight,
                    "Goal Weight": targetWeight
                };
            }).filter(row => row !== null); // Remove entries with no weight
        }
        const worksheet2 = XLSX.utils.json_to_sheet(goalRows);

        // 3. Create Workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet1, "Daily Tracking");
        XLSX.utils.book_append_sheet(workbook, worksheet2, "Goal Progress");

        // 4. Generate Filename & Save
        const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
        XLSX.writeFile(workbook, `diet-tracker_${dateStr}.xlsx`);
    }
};
