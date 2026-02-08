import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const loss = payload[0].value;
        const isLoss = loss >= 0;
        return (
            <div className="glass-panel" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.9)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>{label}</p>
                <p style={{ color: isLoss ? '#3b82f6' : '#ef4444', fontWeight: 'bold', fontSize: '1rem', margin: 0 }}>
                    {isLoss ? 'Lost' : 'Gained'} {Math.abs(loss)} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 'normal' }}>kg</span>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Weight: {payload[0].payload.weight} kg
                </p>
            </div>
        );
    }
    return null;
};

export default function DailyProgressChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="glass-panel" style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p className="text-muted">No progress data yet</p>
            </div>
        );
    }

    return (
        <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                        dataKey="day"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="loss" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.loss >= 0 ? '#3b82f6' : '#ef4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
