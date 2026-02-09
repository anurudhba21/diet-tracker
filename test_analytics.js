const { analytics } = require('./src/utils/analytics.js');

// Mock Data
const entries = {
    '2025-02-01': { weight: 80, habits: { 'Run': true, 'Read': false } },
    '2025-02-02': { weight: 79.5, habits: { 'Run': true, 'Read': true } },
    '2025-02-03': { weight: 79.2, habits: { 'Run': false, 'Read': true } },
    '2025-02-04': { weight: 79.0, habits: { 'Run': true, 'Read': false } },
};

console.log("Testing calculateHabitStats...");
const stats = analytics.calculateHabitStats(entries);
console.log("Stats:", stats);

if (stats.Run === 75 && stats.Read === 50) {
    console.log("PASS: calculateHabitStats");
} else {
    console.error("FAIL: calculateHabitStats");
}

console.log("\nTesting analyzeHabitImpact...");
const impact = analytics.analyzeHabitImpact(entries);
console.log("Impact:", impact);
// Expected: 
// 2/1 -> 2/2: Run=T, Read=F. Delta = -0.5. Run impact -0.5
// 2/2 -> 2/3: Run=T, Read=T. Delta = -0.3. Run impact -0.3, Read impact -0.3
// 2/3 -> 2/4: Run=F, Read=T. Delta = -0.2. Read impact -0.2
// Run total: -0.5, -0.3. Avg: -0.4. Count: 2
// Read total: -0.3, -0.2. Avg: -0.25. Count: 2

const runImpact = impact.find(i => i.habit === 'Run');
const readImpact = impact.find(i => i.habit === 'Read');

if (runImpact && runImpact.avgImpact === -0.4 && readImpact && readImpact.avgImpact === -0.25) {
    console.log("PASS: analyzeHabitImpact");
} else {
    console.error("FAIL: analyzeHabitImpact");
}
