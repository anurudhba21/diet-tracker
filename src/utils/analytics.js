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

    analyzeHabitImpact: (entries) => {
        const sortedDates = Object.keys(entries).sort((a, b) => new Date(a) - new Date(b));
        const habitStats = {};

        for (let i = 0; i < sortedDates.length - 1; i++) {
            const date = sortedDates[i];
            const nextDate = sortedDates[i + 1];

            // Ensure next entry is actually the next day (within 24-48 hours)
            const diffTime = Math.abs(new Date(nextDate) - new Date(date));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1) continue; // Skip if gap in data

            const entry = entries[date];
            const nextEntry = entries[nextDate];

            if (entry.weight && nextEntry.weight) {
                const delta = parseFloat(nextEntry.weight) - parseFloat(entry.weight);
                const weightChange = parseFloat(delta.toFixed(2));

                const habits = entry.habits || {};

                // Track Custom Habits
                Object.keys(habits).forEach(habitName => {
                    if (habits[habitName]) {
                        if (!habitStats[habitName]) {
                            habitStats[habitName] = { deltas: [], count: 0 };
                        }
                        habitStats[habitName].deltas.push(weightChange);
                    }
                });

                // Track Junk Food (Core Metric)
                if (entry.junk) {
                    if (!habitStats['Junk Food']) {
                        habitStats['Junk Food'] = { deltas: [], count: 0 };
                    }
                    habitStats['Junk Food'].deltas.push(weightChange);
                }
            }
        }

        return Object.entries(habitStats)
            .map(([habit, data]) => {
                const count = data.deltas.length;
                if (count === 0) return null;
                const totalDelta = data.deltas.reduce((a, b) => a + b, 0);
                const avgImpact = parseFloat((totalDelta / count).toFixed(2));
                return { habit, avgImpact, count };
            })
            .filter(item => item !== null)
            .sort((a, b) => b.avgImpact - a.avgImpact); // Sort: High Gain -> High Loss
    },

    calculateHabitStats: (entries) => {
        const entryList = Object.values(entries);
        const total = entryList.length;
        if (total === 0) return {};

        const counts = {};
        entryList.forEach(e => {
            const habits = e.habits || {};
            Object.keys(habits).forEach(h => {
                if (habits[h]) {
                    counts[h] = (counts[h] || 0) + 1;
                }
            });

            // Track Junk Food (Core Metric)
            if (e.junk) {
                counts['Junk Food'] = (counts['Junk Food'] || 0) + 1;
            }
        });

        const stats = { total };
        Object.keys(counts).forEach(h => {
            stats[h] = Math.round((counts[h] / total) * 100);
        });

        return stats;
    },

    detectAnomaly: (currentWeight, previousWeight) => {
        if (!currentWeight || !previousWeight) return null;

        const curr = parseFloat(currentWeight);
        const prev = parseFloat(previousWeight);

        if (isNaN(curr) || isNaN(prev)) return null;

        const delta = curr - prev;

        // thresholds
        const GAIN_THRESHOLD = 2.0; // kg
        const LOSS_THRESHOLD = -1.5; // kg

        // Sanity Check
        if (curr > 300 || curr < 30) {
            return {
                isAnomaly: true,
                type: 'Sanity',
                severity: 'high',
                message: `Are you sure? ${curr}kg seems physically unlikely.`
            };
        }

        if (delta > GAIN_THRESHOLD) {
            return {
                isAnomaly: true,
                type: 'Gain',
                severity: 'medium',
                message: `High Gain (+${delta.toFixed(1)}kg). Likely water retention or inflammation.`
            };
        }

        if (delta < LOSS_THRESHOLD) {
            return {
                isAnomaly: true,
                type: 'Loss',
                severity: 'medium',
                message: `Rapid Loss (${delta.toFixed(1)}kg). Could be dehydration or a typo.`
            };
        }

        return null;
    },

    // --- New Features (Resilience & True Weight) ---

    calculateTrueWeight: (entries) => {
        // Exponential Moving Average (EMA)
        // Formula: EMA_today = (Value_today * k) + (EMA_yesterday * (1-k))
        // k = 2 / (N + 1). For N=7 days smoothing, k = 2/8 = 0.25
        const k = 0.2; // Smoothing factor (lower = smoother)

        const sortedDates = Object.keys(entries).sort((a, b) => new Date(a) - new Date(b));
        if (sortedDates.length === 0) return {};

        const emaData = {};
        let previousEMA = null;

        sortedDates.forEach((date, i) => {
            const weight = parseFloat(entries[date].weight);
            if (isNaN(weight)) return;

            if (previousEMA === null) {
                // First entry starts the average
                previousEMA = weight;
            } else {
                previousEMA = (weight * k) + (previousEMA * (1 - k));
            }
            emaData[date] = parseFloat(previousEMA.toFixed(2));
        });

        return emaData;
    },

    calculateResilience: (entries) => {
        const sortedDates = Object.keys(entries).sort((a, b) => new Date(a) - new Date(b));
        if (sortedDates.length < 3) return null; // Need some history

        const spikes = [];
        let totalRecoveryDays = 0;
        let spikeCount = 0;

        // Threshold for a "Spike" (e.g., gain > 0.3kg in one day)
        const SPIKE_THRESHOLD = 0.3;

        for (let i = 1; i < sortedDates.length; i++) {
            const date = sortedDates[i];
            const prevDate = sortedDates[i - 1];

            const currentWeight = parseFloat(entries[date].weight);
            const prevWeight = parseFloat(entries[prevDate].weight);

            if (isNaN(currentWeight) || isNaN(prevWeight)) continue;

            const delta = currentWeight - prevWeight;

            // Detect Spike
            if (delta >= SPIKE_THRESHOLD) {
                // Search forward for recovery (when weight <= prevWeight)
                let recoveredDate = null;
                let daysToRecover = 0;

                for (let j = i + 1; j < sortedDates.length; j++) {
                    const futureDate = sortedDates[j];
                    const futureWeight = parseFloat(entries[futureDate].weight);

                    const timeDiff = new Date(futureDate) - new Date(date);
                    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                    if (futureWeight <= prevWeight) {
                        recoveredDate = futureDate;
                        daysToRecover = dayDiff; // Days from spike to recovery
                        break;
                    }

                    // Timeout: If not recovered in 14 days, ignore (it was real gain)
                    if (dayDiff > 14) break;
                }

                if (recoveredDate) {
                    spikes.push({
                        spikeDate: date,
                        spikeAmount: delta,
                        daysToRecover
                    });
                    totalRecoveryDays += daysToRecover;
                    spikeCount++;
                }
            }
        }

        if (spikeCount === 0) return { avgRecovery: 0, score: 'Unbreakable', count: 0 };

        const avgRecovery = (totalRecoveryDays / spikeCount).toFixed(1);

        let score = 'Normal';
        if (avgRecovery <= 2) score = 'Rubber Band'; // Very resilient
        else if (avgRecovery <= 4) score = 'Steady';
        else score = 'Slow Burn';

        return {
            avgRecovery,
            score,
            count: spikeCount,
            lastSpike: spikes[spikes.length - 1]
        };
    }
};
