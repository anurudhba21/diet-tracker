import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.9)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>{payload[0].name}</p>
                <p style={{ color: payload[0].payload.fill, fontWeight: 'bold', fontSize: '1.25rem', margin: 0 }}>
                    {payload[0].value}%
                </p>
            </div>
        );
    }
    return null;
};

export default function GoalPieChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="glass-panel" style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p className="text-muted">Set a goal to see progress</p>
            </div>
        );
    }

    const COLORS = ['#3b82f6', '#ef4444']; // Blue for Completed, Red for Remaining

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <ResponsiveContainer width="99%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#f8fafc" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {data[0].value}%
                    </text>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
