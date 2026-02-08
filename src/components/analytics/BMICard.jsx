import { Activity } from 'lucide-react';

export default function BMICard({ bmi }) {
    if (!bmi) return null;

    return (
        <div className="glass-panel" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.0) 100%)`,
            borderLeft: `4px solid ${bmi.color}`
        }}>
            <div>
                <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={14} /> BMI Score
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: 1.2, marginTop: '4px', color: 'var(--text-main)' }}>
                    {bmi.value}
                </div>
            </div>

            <div style={{ textAlign: 'right' }}>
                <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: `${bmi.color}20`,
                    color: bmi.color,
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    border: `1px solid ${bmi.color}40`
                }}>
                    {bmi.category}
                </div>
            </div>
        </div>
    );
}
