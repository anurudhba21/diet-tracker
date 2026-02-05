import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export default function History() {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            api.getEntries(user.id).then(data => {
                // API returns array, sort desc
                const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setEntries(sorted);
            });
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
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 'var(--space-4)' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                            <th style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)' }}>Date</th>
                            <th style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)' }}>Weight</th>
                            <th style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)' }}>Habits</th>
                            <th style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)' }}>Junk?</th>
                            <th style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((item) => (
                            <tr
                                key={item.date}
                                onClick={() => navigate(`/entry/${item.date}`)}
                                style={{
                                    borderBottom: '1px solid var(--color-border)',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    ':hover': { background: 'var(--color-bg)' }
                                }}
                            >
                                <td style={{ padding: 'var(--space-3)', fontWeight: '500' }}>
                                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
                                </td>
                                <td style={{ padding: 'var(--space-3)' }}>
                                    {item.weight ? `${item.weight} kg` : '—'}
                                </td>
                                <td style={{ padding: 'var(--space-3)' }}>
                                    {Object.keys(item.habits || {}).filter(k => item.habits[k]).length > 0 ? (
                                        <span className="badge" style={{ background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                                            {Object.keys(item.habits || {}).filter(k => item.habits[k]).length}
                                        </span>
                                    ) : (
                                        <span style={{ color: 'var(--color-text-muted)' }}>0</span>
                                    )}
                                </td>
                                <td style={{ padding: 'var(--space-3)' }}>
                                    {item.junk_flag ? (
                                        <span style={{ color: 'var(--color-danger)' }}>Yes 🍔</span>
                                    ) : (
                                        <span style={{ color: 'var(--color-primary)' }}>No 🥗</span>
                                    )}
                                </td>
                                <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm("Are you sure you want to delete this entry?")) {
                                                api.deleteEntry(item.id)
                                                    .then(() => {
                                                        setEntries(prev => prev.filter(e => e.id !== item.id));
                                                    })
                                                    .catch(err => {
                                                        console.error(err);
                                                        alert("Failed to delete: " + err.message);
                                                    });
                                            }
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
