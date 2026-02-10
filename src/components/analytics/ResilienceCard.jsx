import { motion } from 'framer-motion';
import { Activity, Zap, TrendingUp, ShieldCheck } from 'lucide-react';

export default function ResilienceCard({ data }) {
    if (!data || data.count === 0) return null;

    const { avgRecovery, score, count } = data;

    let icon = <Activity size={24} />;
    let color = 'var(--text-main)';
    let bgColor = 'rgba(255, 255, 255, 0.05)';
    let message = '';

    switch (score) {
        case 'Rubber Band':
            icon = <Zap size={24} color="#f59e0b" />; // Amber/Gold
            color = '#f59e0b';
            bgColor = 'rgba(245, 158, 11, 0.1)';
            message = "Your metabolism adapts quickly!";
            break;
        case 'Steady':
            icon = <ShieldCheck size={24} color="#3b82f6" />; // Blue
            color = '#3b82f6';
            bgColor = 'rgba(59, 130, 246, 0.1)';
            message = "Consistent recovery from cheat meals.";
            break;
        case 'Slow Burn':
            icon = <TrendingUp size={24} color="#ef4444" />; // Red
            color = '#ef4444';
            bgColor = 'rgba(239, 68, 68, 0.1)';
            message = "Spikes take time to settle.";
            break;
        default: // Unbreakable (0 spikes)
            icon = <ShieldCheck size={24} color="#10b981" />; // Green
            color = '#10b981';
            bgColor = 'rgba(16, 185, 129, 0.1)';
            message = "Rock solid consistency!";
            break;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{
                background: bgColor,
                border: `1px solid ${color}33`, // 20% opacity hex
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: color, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                            Bounce Back Time
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '4px 0', color: 'var(--text-bright)' }}>
                            {avgRecovery} Days
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {message}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
