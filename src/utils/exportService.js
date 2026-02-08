import * as XLSX from 'xlsx';
import { analytics } from './analytics';

export const exportService = {
    generateExcel: (entries, goal) => {
        // 1. Prepare Daily Tracking Data
        const sortedDates = Object.keys(entries).sort((a, b) => new Date(b) - new Date(a));
        const dailyRows = sortedDates.map(date => {
            const e = entries[date];
            return {
                Date: date,
                Weight_kg: e.weight || '-',
                Breakfast: e.breakfast || '',
                Mid_Snack: e.mid_snack || '',
                Lunch: e.lunch || '',
                Evening: e.evening || '',
                Dinner: e.dinner || '',
                Junk_Food: e.junk_flag ? 'Yes' : 'No',
                Buttermilk: e.buttermilk_flag ? 'Yes' : 'No',
                Omega3: e.omega3_flag ? 'Yes' : 'No',
                Notes: e.notes || ''
            };
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
