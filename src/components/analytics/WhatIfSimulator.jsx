import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Calendar, ArrowRight, TrendingDown, Info } from 'lucide-react';

export default function WhatIfSimulator({ currentWeight, targetWeight, currentRate, habitImpact }) {
    const [toggledHabits, setToggledHabits] = useState({});
    const [simulatedRate, setSimulatedRate] = useState(currentRate);
    const [simulatedDate, setSimulatedDate] = useState(null);
    const [dateDiff, setDateDiff] = useState(0);

    // Initial calculation
    useEffect(() => {
        if (currentRate && habitImpact) {
            calculateSimulation();
        }
    }, [currentRate, habitImpact, toggledHabits]);

    const calculateSimulation = () => {
        let newRate = parseFloat(currentRate);

        // Adjust rate based on toggled habits
        Object.keys(toggledHabits).forEach(habit => {
            const impact = toggledHabits[habit];
            // If habit is toggled ON, we add its impact (could be neg or pos)
            // If impact is negative (weight loss), rate increases (more loss per week)
            // Wait, currentRate is usually positive for loss? Let's check analytics.js
            // In analytics.js: ratePerWeek = slope * 7. 
            // If losing weight, slope is negative. So ratePerWeek is negative.
            // E.g., -0.5 kg/week.

            // Impact from analyzeHabitImpact is avg daily change.
            // E.g., Junk Food: +0.2 kg (gain). Running: -0.1 kg (loss).

            // So New Rate = Current Rate + Sum(Impact * 7)
            // If I add Junk Food (+0.2/day), Rate becomes (-0.5) + (1.4) = +0.9 (Gain). Correct.
            // If I add Running (-0.1/day), Rate becomes (-0.5) + (-0.7) = -1.2 (Faster Loss). Correct.

            newRate += (impact * 7);
        });

        setSimulatedRate(newRate);

        // Calculate New Date
        // Target = CurrentWeight + Rate * Weeks
        // Weeks = (Target - CurrentWeight) / Rate
        // Days = Weeks * 7

        if (newRate >= 0) {
            setSimulatedDate(null); // Gaining or Stagnant
            return;
        }

        const remainingWeight = parseFloat(targetWeight) - parseFloat(currentWeight);
        // remainingWeight is negative (e.g. 70 - 80 = -10 to lose)
        // Rate is negative (e.g. -0.5)
        // Weeks = -10 / -0.5 = 20 weeks. Correct.

        const weeksRemaining = remainingWeight / newRate;
        const daysRemaining = Math.ceil(weeksRemaining * 7);

        const today = new Date();
        const newDate = new Date(today.getTime() + (daysRemaining * 24 * 60 * 60 * 1000));
        setSimulatedDate(newDate);

        // Compare with current predicted date (derived from currentRate)
        const currentWeeks = remainingWeight / parseFloat(currentRate);
        const currentDays = Math.ceil(currentWeeks * 7);
        setDateDiff(currentDays - daysRemaining); // Positive = Saved Days
    };

    const toggleHabit = (habit, impact) => {
        setToggledHabits(prev => {
            const newState = { ...prev };
            if (newState[habit]) {
                delete newState[habit];
            } else {
                newState[habit] = impact;
            }
            return newState;
        });
    };

    if (!habitImpact || habitImpact.length === 0 || !currentRate) return null;

    // Filter relevant habits (top impacts)
    const impactfulHabits = habitImpact
        .filter(h => Math.abs(h.avgImpact) > 0.05) // Filter noise
        .slice(0, 5);

    if (impactfulHabits.length === 0) return null;

    return (
        <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '12px' }}>
                    <Sliders size={24} className="text-primary" style={{ color: '#3b82f6' }} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>What-If Simulator</h3>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>See how habits affect your timeline</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Simulate Daily Habits
                    </p>
                    {impactfulHabits.map(h => (
                        <motion.button
                            key={h.habit}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleHabit(h.habit, h.avgImpact)}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                background: toggledHabits[h.habit]
                                    ? (h.avgImpact < 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)') // Green for good, Red for bad active
                                    : 'rgba(255,255,255,0.05)',
                                border: toggledHabits[h.habit]
                                    ? (h.avgImpact < 0 ? '1px solid var(--primary-500)' : '1px solid var(--danger)')
                                    : '1px solid transparent',
                                borderRadius: '12px',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span style={{ fontWeight: 500 }}>{h.habit}</span>
                            <span style={{
                                fontSize: '0.85rem',
                                color: h.avgImpact < 0 ? 'var(--primary-400)' : 'var(--danger)',
                                fontWeight: 600
                            }}>
                                {h.avgImpact > 0 ? '+' : ''}{h.avgImpact} kg/day
                            </span>
                        </motion.button>
                    ))}
                </div>

                {/* Results */}
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

                    {!simulatedDate ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            <TrendingDown size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                            <p>Goal not reachable with current settings.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '24px' }}>
                                <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Estimated Completion</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-bright)' }}>
                                    {simulatedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: dateDiff > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                {dateDiff > 0 ? (
                                    <TrendingDown size={20} color="var(--primary-500)" />
                                ) : (
                                    <Info size={20} color="var(--text-muted)" />
                                )}
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: dateDiff > 0 ? 'var(--primary-400)' : 'var(--text-dim)' }}>
                                        {dateDiff > 0 ? `${dateDiff} Days Saved!` : dateDiff < 0 ? `${Math.abs(dateDiff)} Days Delayed` : 'No Change'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Rate: {simulatedRate.toFixed(2)} kg/week
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
