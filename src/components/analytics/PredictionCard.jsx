import { motion } from 'framer-motion';
import { Calendar, TrendingDown, TrendingUp, AlertCircle, HelpCircle } from 'lucide-react';

export default function PredictionCard({ prediction }) {
    if (!prediction) return null;

    const { status, predictedDate, ratePerWeek, daysRemaining } = prediction;

    let content;
    let color = 'var(--text-main)';
    let bgColor = 'rgba(255, 255, 255, 0.05)';
    let icon = <HelpCircle size={24} />;

    switch (status) {
        case 'insufficient_data':
            content = (
                <>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Needs More Data</h4>
                    <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        Log at least 3 daily weigh-ins to unlock smart predictions.
                    </p>
                </>
            );
            icon = <HelpCircle size={24} color="var(--text-muted)" />;
            break;

        case 'gaining':
            content = (
                <>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#ef4444' }}>Trend Alert</h4>
                    <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        Current trend shows weight gain (+{ratePerWeek} kg/week). Adjust habits to get back on track!
                    </p>
                </>
            );
            bgColor = 'rgba(239, 68, 68, 0.1)';
            icon = <TrendingUp size={24} color="#ef4444" />;
            break;

        case 'too_far':
            content = (
                <>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#f59e0b' }}>Long Term Goal</h4>
                    <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        At current rate ({ratePerWeek} kg/week), the goal is over a year away. Keep pushing!
                    </p>
                </>
            );
            bgColor = 'rgba(245, 158, 11, 0.1)';
            icon = <Calendar size={24} color="#f59e0b" />;
            break;

        case 'on_track':
            const dateStr = predictedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            content = (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary-400)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                                Estimated Goal Date
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '4px 0', color: 'var(--text-bright)' }}>
                                {dateStr}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                                <span>📉 {ratePerWeek} kg/week</span>
                                <span>⏳ {daysRemaining} days left</span>
                            </div>
                        </div>
                    </div>
                </>
            );
            bgColor = 'rgba(16, 185, 129, 0.1)'; // Primary/Green tint
            color = 'var(--primary-500)';
            icon = <Calendar size={28} color="var(--primary-500)" />;
            break;

        default:
            return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{
                background: bgColor,
                border: `1px solid ${status === 'on_track' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px'
            }}
        >
            <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                {content}
            </div>
        </motion.div>
    );
}
