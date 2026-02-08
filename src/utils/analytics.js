export const analytics = {
    // Calculate key metrics
    calculateProgress: (goal, currentWeight) => {
        if (!goal || !currentWeight) return null;

        const start = parseFloat(goal.startWeight);
        const target = parseFloat(goal.targetWeight);
        const current = parseFloat(currentWeight);

        if (isNaN(start) || isNaN(target) || isNaN(current)) return null;

        const totalToLose = start - target;
        const lostSoFar = start - current;
        const remaining = current - target;

        // Avoid division by zero
        const percent = totalToLose !== 0 ? (lostSoFar / totalToLose) * 100 : 0;

        return {
            current,
            lost: lostSoFar.toFixed(1),
            remaining: remaining.toFixed(1),
            percent: Math.min(Math.max(percent, 0), 100).toFixed(0) // Clamp 0-100
        };
    },

    calculateBMI: (weightKg, heightCm) => {
        if (!weightKg || !heightCm) return null;

        const weight = parseFloat(weightKg);
        const height = parseFloat(heightCm);

        if (isNaN(weight) || isNaN(height) || height === 0) return null;

        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);

        let category = 'Normal';
        let color = '#10b981'; // Green

        if (bmi < 18.5) {
            category = 'Underweight';
            color = '#3b82f6'; // Blue
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            color = '#f59e0b'; // Orange
        } else if (bmi >= 30) {
            category = 'Obese';
            color = '#ef4444'; // Red
        }

        return {
            value: bmi.toFixed(1),
            category,
            color
        };
    },

    // Prepare data for Recharts
    prepareChartData: (entries, goal) => {
        const data = Object.keys(entries)
            .sort((a, b) => new Date(a) - new Date(b))
            .map(date => {
                const entry = entries[date];
                const weight = parseFloat(entry.weight);
                if (isNaN(weight)) return null;

                return {
                    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    weight,
                    target: goal ? parseFloat(goal.targetWeight) : null
                };
            })
            .filter(item => item !== null);

        return data;
    },

    prepareDailyProgressData: (entries, goal) => {
        if (!goal) return [];
        const start = parseFloat(goal.startWeight);
        if (isNaN(start)) return [];

        return Object.keys(entries)
            .sort((a, b) => new Date(a) - new Date(b))
            .map((date, index) => {
                const entry = entries[date];
                const weight = parseFloat(entry.weight);
                if (isNaN(weight)) return null;

                const loss = start - weight;
                return {
                    day: `Day ${index + 1}`,
                    loss: parseFloat(loss.toFixed(2)),
                    weight // Keep weight for tooltip if needed
                };
            })
            .filter(item => item !== null);
    },

    prepareGoalPieData: (goal, currentWeight) => {
        if (!goal || !currentWeight) return [];

        const stats = analytics.calculateProgress(goal, currentWeight);
        if (!stats) return [];

        const percent = parseFloat(stats.percent);
        const remaining = 100 - percent;

        return [
            { name: 'Completed', value: percent },
            { name: 'Remaining', value: remaining < 0 ? 0 : remaining } // Don't show negative remaining
        ];
    },

    predictGoalDate: (entries, goal) => {
        if (!goal || !goal.targetWeight) return null;

        // 1. Prepare Data (Sort & Filter)
        const validEntries = Object.entries(entries)
            .map(([date, data]) => ({ date: new Date(date), weight: parseFloat(data.weight) }))
            .filter(e => !isNaN(e.weight))
            .sort((a, b) => a.date - b.date);

        if (validEntries.length < 3) {
            return { status: 'insufficient_data' };
        }

        // Use last 30 entries for recent trend
        const recentEntries = validEntries.slice(-30);

        // 2. Linear Regression (Least Squares)
        // x = time (days from start), y = weight
        const startDate = recentEntries[0].date.getTime();
        const data = recentEntries.map(e => ({
            x: (e.date.getTime() - startDate) / (1000 * 60 * 60 * 24), // Days since first entry in set
            y: e.weight
        }));

        const n = data.length;
        const sumX = data.reduce((acc, p) => acc + p.x, 0);
        const sumY = data.reduce((acc, p) => acc + p.y, 0);
        const sumXY = data.reduce((acc, p) => acc + p.x * p.y, 0);
        const sumXX = data.reduce((acc, p) => acc + p.x * p.x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // 3. Interpret Results
        const currentRatePerWeek = slope * 7; // kg/week

        // If gaining weight or plateaued (slope >= 0)
        if (slope >= 0) {
            return {
                status: 'gaining',
                ratePerWeek: currentRatePerWeek.toFixed(2)
            };
        }

        // 4. Calculate Prediction
        // target = slope * days + intercept
        // days = (target - intercept) / slope
        const targetWeight = parseFloat(goal.targetWeight);
        const daysToGoal = (targetWeight - intercept) / slope;

        // Add days to start prediction date
        const predictedDate = new Date(startDate + (daysToGoal * 24 * 60 * 60 * 1000));

        // Cap prediction at 1 year out to avoid absurd dates
        const oneYearOut = new Date();
        oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);

        if (predictedDate > oneYearOut) {
            return {
                status: 'too_far',
                ratePerWeek: currentRatePerWeek.toFixed(2)
            };
        }

        return {
            status: 'on_track',
            predictedDate,
            ratePerWeek: currentRatePerWeek.toFixed(2),
            daysRemaining: Math.ceil((predictedDate - new Date()) / (1000 * 60 * 60 * 24))
        };
    },

    calculateStreaks: (entries) => {
        const dates = Object.keys(entries)
            .sort((a, b) => new Date(b) - new Date(a)); // Newest first

        if (dates.length === 0) return { current: 0, longest: 0 };

        // Current Streak
        let current = 0;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        // Check if streak is active (has entry today OR yesterday)
        const latestDate = new Date(dates[0]).toDateString();
        if (latestDate !== today && latestDate !== yesterday) {
            current = 0;
        } else {
            // Count backwards
            let checkDate = new Date(latestDate);
            for (const dateStr of dates) {
                if (new Date(dateStr).toDateString() === checkDate.toDateString()) {
                    current++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        // Longest Streak
        let longest = 0;
        let temp = 0;
        if (dates.length > 0) {
            let prevDate = null;
            // Sort oldest first for this calculation
            const sortedDates = [...dates].sort((a, b) => new Date(a) - new Date(b));

            for (const dateStr of sortedDates) {
                const d = new Date(dateStr);
                if (!prevDate) {
                    temp = 1;
                } else {
                    const diffTime = Math.abs(d - prevDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        temp++;
                    } else if (diffDays > 1) {
                        temp = 1; // Reset if gap > 1 day
                    }
                    // if diffDays == 0 (duplicate), ignore
                }
                if (temp > longest) longest = temp;
                prevDate = d;
            }
        }

        return { current, longest };
    },

    calculateHabitStats: (entries) => {
        const entryList = Object.values(entries);
        const total = entryList.length;
        if (total === 0) return { junk: 0, buttermilk: 0, omega3: 0 };

        const junkCount = entryList.filter(e => e.junk_flag).length;
        const buttermilkCount = entryList.filter(e => e.buttermilk_flag).length;
        const omega3Count = entryList.filter(e => e.omega3_flag).length;

        return {
            total,
            junk: Math.round((junkCount / total) * 100),
            buttermilk: Math.round((buttermilkCount / total) * 100),
            omega3: Math.round((omega3Count / total) * 100)
        };
    }
};
