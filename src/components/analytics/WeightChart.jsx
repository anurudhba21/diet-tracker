import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function WeightChart({ data, target }) {
    if (!data || data.length === 0) {
        return (
            <div className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p className="text-muted">Not enough data to graph.</p>
            </div>
        );
    }

    // Calculate domain for better view
    const weights = data.map(d => d.weight);
    const min = Math.min(...weights, target || 100) - 2;
    const max = Math.max(...weights, target || 0) + 2;

    return (
        <div className="card" style={{ height: '350px', padding: 'var(--space-2)' }}>
            <h3 style={{ marginBottom: 'var(--space-2)', fontSize: '1rem', textAlign: 'center' }}>Weight Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[Math.floor(min), Math.ceil(max)]}
                        hide={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    {target && (
                        <ReferenceLine y={target} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'right', value: 'Goal', fill: '#10b981', fontSize: 10 }} />
                    )}
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 6 }}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
