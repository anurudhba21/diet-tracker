import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarHeatmap({ entries }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Generate grid cells
    const cells = [];

    // Add empty cells for padding start
    // Adjust firstDay to make Monday = 0 (standard is Sun = 0)
    const padding = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < padding; i++) {
        cells.push(<div key={`pad-${i}`} style={{ height: '40px' }} />);
    }

    // Add actual days
    for (let day = 1; day <= days; day++) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const entry = entries[dateStr];

        let bg = 'rgba(255, 255, 255, 0.05)'; // Default empty
        let border = 'transparent';
        let content = <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{day}</span>;

        if (entry && entry.weight) {
            // Calculate delta if possible
            // Note: This requires looking up previous day, which is complex in this loop. 
            // Simplified logic: Just show presence or specific color if we pre-calculated deltas.
            // For now, Green if entry exists (Positive action), maybe Red if gain (if we had delta).
            // Let's rely on simple presence for MVP, or check if we can pass a map with deltas.

            // If we want color coding based on loss/gain, we need that data.
            // Assuming 'entry' might have a 'delta' property if we pre-processed it. 
            // If not, we'll just stick to "Logged = Good".

            // Let's assume entry has a 'delta' property for now (we can add this in the parent).

            if (entry.delta !== undefined) {
                if (entry.delta < 0) {
                    bg = 'rgba(16, 185, 129, 0.2)'; // Green
                    border = 'rgba(16, 185, 129, 0.4)';
                } else if (entry.delta > 0) {
                    bg = 'rgba(239, 68, 68, 0.2)'; // Red
                    border = 'rgba(239, 68, 68, 0.4)';
                } else {
                    bg = 'rgba(59, 130, 246, 0.2)'; // Blue (Maintain)
                    border = 'rgba(59, 130, 246, 0.4)';
                }
            } else {
                // Fallback if no delta (e.g. first entry)
                bg = 'rgba(59, 130, 246, 0.2)';
                border = 'rgba(59, 130, 246, 0.4)';
            }

            content = (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{day}</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{entry.weight}</span>
                </div>
            );
        }

        cells.push(
            <div
                key={day}
                className="calendar-cell"
                style={{
                    height: '40px',
                    background: bg,
                    borderRadius: '8px',
                    border: `1px solid ${border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: entry ? 'pointer' : 'default',
                    transition: 'all 0.2s ease'
                }}
                title={entry ? `Weight: ${entry.weight}kg` : ''}
            >
                {content}
            </div>
        );
    }

    return (
        <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{monthName}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={prevMonth} className="btn-ghost" style={{ padding: '4px' }}><ChevronLeft size={20} /></button>
                    <button onClick={nextMonth} className="btn-ghost" style={{ padding: '4px' }}><ChevronRight size={20} /></button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '8px' }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{d}</div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                {cells}
            </div>
        </div>
    );
}
