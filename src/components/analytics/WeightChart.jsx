import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function WeightChart({ data, target }) {
    if (!data || data.length === 0) {
        return (
            <div className="glass-panel" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                    <p style={{ fontSize: '2rem', margin: 0 }}>📉</p>
                </div>
                <p className="text-muted">Not enough data to graph.</p>
            </div>
        );
    }

    // Calculate domain for better view
    const weights = data.map(d => d.weight);
    const min = Math.min(...weights, target || 100) - 2;
    const max = Math.max(...weights, target || 0) + 2;

    return (
        <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={10}
                    />
                    <YAxis
                        domain={[Math.floor(min), Math.ceil(max)]}
                        hide={false}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        width={35}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            color: '#f8fafc'
                        }}
                        itemStyle={{ color: '#f8fafc' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    />
                    {target && (
                        <ReferenceLine y={target} stroke="#3b82f6" strokeDasharray="3 3" label={{ position: 'right', value: 'Goal', fill: '#3b82f6', fontSize: 10 }} />
                    )}
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#0f172a', stroke: '#10b981' }}
                        activeDot={{ r: 6, fill: '#10b981', stroke: 'rgba(16, 185, 129, 0.5)', strokeWidth: 8 }}
                        connectNulls
                        animationDuration={1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
