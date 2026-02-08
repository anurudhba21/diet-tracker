import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function HabitImpactCard({ impactData }) {
    if (!impactData || impactData.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{ padding: '20px', marginTop: '24px' }}
        >
            <h3 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Habit Impact Analysis</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {impactData.map((item, index) => {
                    const isPositive = item.avgImpact > 0; // Weight Gain
                    const isNegative = item.avgImpact < 0; // Weight Loss
                    const isNeutral = item.avgImpact === 0;

                    let color = 'var(--text-muted)';
                    let icon = <Minus size={16} />;
                    let bgColor = 'rgba(255, 255, 255, 0.05)';

                    if (isPositive) {
                        color = '#ef4444'; // Red for gain
                        icon = <TrendingUp size={16} />;
                        bgColor = 'rgba(239, 68, 68, 0.1)';
                    } else if (isNegative) {
                        color = '#10b981'; // Green for loss
                        icon = <TrendingDown size={16} />;
                        bgColor = 'rgba(16, 185, 129, 0.1)';
                    }

                    return (
                        <div key={item.habit} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: bgColor,
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'rgba(0,0,0,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: color
                                }}>
                                    {icon}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.habit}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Based on {item.count} logs
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold', color: color, fontSize: '1rem' }}>
                                    {isPositive ? '+' : ''}{item.avgImpact} kg
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    avg change
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <p style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                *Average next-day weight change when habit is tracked.
            </p>
        </motion.div>
    );
}
