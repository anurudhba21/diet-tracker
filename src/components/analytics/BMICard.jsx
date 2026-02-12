import { Activity } from 'lucide-react';

export default function BMICard({ bmi }) {
    if (!bmi) return null;

    return (
        <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '12px',
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.0) 100%)`,
            borderLeft: `4px solid ${bmi.color}`,
            padding: '16px'
        }}>
            <div>
                <div className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Activity size={12} /> BMI Score
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', lineHeight: 1.1, marginTop: '2px', color: 'var(--text-main)' }}>
                    {bmi.value}
                </div>
            </div>

            <div style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '12px',
                background: `${bmi.color}20`,
                color: bmi.color,
                fontWeight: '700',
                fontSize: '0.75rem',
                border: `1px solid ${bmi.color}40`
            }}>
                {bmi.category}
            </div>
        </div>
    );
}
