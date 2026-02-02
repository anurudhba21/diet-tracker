import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';

export default function History({ onSelectDate }) {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        if (user) {
            setEntries(storage.getAllEntries(user.id));
        }
    }, [user]);

    if (entries.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <p className="text-muted">No history yet.</p>
                <p className="text-muted">Start logging today!</p>
            </div>
        );
    }

    return (
        <div>
            {entries.map((item) => (
                <div
                    key={item.date}
                    className="card"
                    onClick={() => onSelectDate(item.date)}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <div>
                        <h3 style={{ fontSize: '1.1rem' }}>{item.date}</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                            {item.weight ? `${item.weight} kg` : 'No weight'} • {Object.keys(item).filter(k => ['junk_flag', 'buttermilk_flag', 'omega3_flag'].includes(k) && item[k]).length} Habits
                        </p>
                    </div>
                    <div style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>
                        ›
                    </div>
                </div>
            ))}
        </div>
    );
}
