import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#f8fafc',
                            fontSize: '12px'
                        }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    />
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
