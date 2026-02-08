import { Trophy, Flame, Zap, Target, Award, Star } from 'lucide-react';

export default function AchievementsCard({ stats, streaks }) {
    if (!stats || !streaks) return null;

    const achievements = [
        {
            id: 'starter',
            title: 'Starter',
            desc: 'Logged your first entry',
            icon: <Star size={20} />,
            color: '#fbbf24', // Gold
            unlocked: true, // If they see this, they have at least 1 entry (usually)
        },
        {
            id: 'on_fire',
            title: 'On Fire',
            desc: '3 Day Streak',
            icon: <Flame size={20} />,
            color: '#ef4444', // Red
            unlocked: streaks.current >= 3,
        },
        {
            id: 'unstoppable',
            title: 'Unstoppable',
            desc: '7 Day Streak',
            icon: <Zap size={20} />,
            color: '#8b5cf6', // Purple
            unlocked: streaks.current >= 7,
        },
        {
            id: 'result_getter',
            title: 'Result Getter',
            desc: 'Lost 1kg',
            icon: <Award size={20} />,
            color: '#3b82f6', // Blue
            unlocked: parseFloat(stats.lost) >= 1.0,
        },
        {
            id: 'goal_crusher',
            title: 'Goal Crusher',
            desc: 'Hit Target Weight',
            icon: <Trophy size={20} />,
            color: '#10b981', // Green
            unlocked: parseFloat(stats.remaining) <= 0,
        }
    ];

    // Calculate progress for locked items? (Maybe later)

    return (
        <div className="glass-panel">
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={20} className="text-primary" /> Achievements
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px' }}>
                {achievements.map(ach => (
                    <div
                        key={ach.id}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            opacity: ach.unlocked ? 1 : 0.4,
                            filter: ach.unlocked ? 'none' : 'grayscale(100%)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: ach.unlocked ? `${ach.color}20` : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${ach.unlocked ? ach.color : 'rgba(255,255,255,0.1)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '8px',
                            color: ach.unlocked ? ach.color : 'var(--text-muted)',
                            boxShadow: ach.unlocked ? `0 0 15px ${ach.color}40` : 'none'
                        }}>
                            {ach.icon}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '2px' }}>
                            {ach.title}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.1 }}>
                            {ach.desc}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
