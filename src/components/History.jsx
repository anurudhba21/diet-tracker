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
            {entries.map((item) => (
                <div
                    key={item.date}
                    className="card"
                    onClick={() => navigate(`/entry/${item.date}`)}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}
                >
                    <div>
                        <h3 style={{ fontSize: '1.1rem' }}>{new Date(item.date).toDateString()}</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                            {item.weight ? `${item.weight} kg` : 'No weight'} • {Object.keys(item.habits || {}).filter(k => item.habits[k]).length} Habits
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                        <div style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>
                            ›
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
