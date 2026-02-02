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
            // Find latest weight
            const latestDate = sortedDates.find(d => entries[d].weight);
            const currentWeight = latestDate ? entries[latestDate].weight : 0;

            const stats = analytics.calculateProgress(goal, currentWeight);

            goalRows = [{
                Start_Weight_kg: goal.startWeight,
                Target_Weight_kg: goal.targetWeight,
                Current_Weight_kg: currentWeight || '-',
                Weight_Lost_kg: stats ? stats.lost : '-',
                Remaining_kg: stats ? stats.remaining : '-',
                Progress_Percent: stats ? `${stats.percent}%` : '-',
                Goal_Last_Updated: new Date(goal.updatedAt).toLocaleDateString()
            }];
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
