import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { useAggregatedData } from '../../hooks/useAggregatedData';
import { motion } from 'framer-motion';

export default function WorkoutStats() {
    const { history, loading } = useAggregatedData();

    const chartData = useMemo(() => {
        if (!history) return [];
        // Take last 14 entries for trend
        const recent = history.slice(0, 14).reverse();

        return recent.map(entry => {
            let totalVolume = 0;
            let completedWorkouts = 0;

            if (entry.type === 'workout' || true) { // entries are daily_entries
                if (entry.workouts) {
                    Object.values(entry.workouts).forEach(w => {
                        if (w.completed) completedWorkouts++;
                        if (w.sets) {
                            w.sets.forEach(s => {
                                const weight = s.weight_kg || 0;
                                const reps = s.reps || 0;
                                totalVolume += (weight * reps);
                            });
                        }
                    });
                }
            }

            return {
                date: new Date(entry.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                volume: totalVolume,
                weight: entry.weight || null
            };
        });
    }, [history]);

    if (loading) return <div className="p-4 text-center">Loading stats...</div>;
    if (chartData.length === 0) return <div className="p-4 text-center">No data to display yet.</div>;

    return (
        <div style={{ display: 'grid', gap: '24px' }}>
            {/* Volume Chart */}
            <motion.div
                className="glass-panel"
                style={{ padding: '20px' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--text-muted)' }}>Volume Load (kg)</h3>
                <div style={{ height: '200px', width: '100%' }}>
                    <ResponsiveContainer>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Bar dataKey="volume" fill="var(--primary-500)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Weight Chart */}
            <motion.div
                className="glass-panel"
                style={{ padding: '20px' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--text-muted)' }}>Body Weight Trend</h3>
                <div style={{ height: '200px', width: '100%' }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData.filter(d => d.weight !== null)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={['dataMin - 2', 'dataMax + 2']}
                                hide={true} // Cleaner look, tooltip shows value
                            />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="var(--secondary-400)"
                                strokeWidth={3}
                                dot={{ fill: 'var(--secondary-400)', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
}
