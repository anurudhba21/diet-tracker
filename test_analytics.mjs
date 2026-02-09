import { analytics } from './src/utils/analytics.js';

// Mock Data
// Use a flat structure similar to what the API returns in the test, 
// although analytics.js functions expect entries object keyed by date for some functions
// and array for others? 
// calculateHabitStats expects OBJECT keyed by date (entries)
// analyzeHabitImpact expects OBJECT keyed by date (entries)

const entries = {
    '2025-02-01': { weight: 80, habits: { 'Run': true, 'Read': false } },
    '2025-02-02': { weight: 79.5, habits: { 'Run': true, 'Read': true } },
    '2025-02-03': { weight: 79.2, habits: { 'Run': false, 'Read': true } },
    '2025-02-04': { weight: 79.0, habits: { 'Run': true, 'Read': false } },
};

console.log("Testing calculateHabitStats...");
const stats = analytics.calculateHabitStats(entries);
console.log("Stats:", stats);

// Total entries = 4
// Run: 3/4 = 75%
// Read: 2/4 = 50%

if (stats.Run === 75 && stats.Read === 50) {
    console.log("PASS: calculateHabitStats");
} else {
    console.error("FAIL: calculateHabitStats", stats);
}

console.log("\nTesting analyzeHabitImpact...");
const impact = analytics.analyzeHabitImpact(entries);
console.log("Impact:", impact);

// 2/1 -> 2/2: Run=T, Read=F. Delta = -0.5. Run impact -0.5
// 2/2 -> 2/3: Run=T, Read=T. Delta = -0.3. Run impact -0.3, Read impact -0.3
// 2/3 -> 2/4: Run=F, Read=T. Delta = -0.2. Read impact -0.2

// Run total: -0.5 (from 2/1) + -0.3 (from 2/2). Total: -0.8. Count: 2. Avg: -0.4
// Read total: -0.3 (from 2/2) + -0.2 (from 2/3). Total: -0.5. Count: 2. Avg: -0.25

const runImpact = impact.find(i => i.habit === 'Run');
const readImpact = impact.find(i => i.habit === 'Read');

if (runImpact && runImpact.avgImpact === -0.4 && readImpact && readImpact.avgImpact === -0.25) {
    console.log("PASS: analyzeHabitImpact");
} else {
    console.error("FAIL: analyzeHabitImpact");
    console.log("Run Expected: -0.4, Got:", runImpact?.avgImpact);
    console.log("Read Expected: -0.25, Got:", readImpact?.avgImpact);
}
