import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Trash2, Calendar, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

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
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel"
                style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
            >
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '50%' }}>
                    <Calendar size={48} color="var(--text-muted)" />
                </div>
                <h3 className="text-gradient">No History Yet</h3>
                <p className="text-muted" style={{ maxWidth: '280px', margin: '0 auto' }}>
                    Start logging your daily progress to see your history build up here!
                </p>
                <button onClick={() => navigate('/')} className="btn" style={{ marginTop: '16px' }}>
                    Track Today
                </button>
            </motion.div>
        );
    }

    return (
        <div style={{ paddingBottom: '100px' }}>
            <h2 className="text-gradient" style={{ marginBottom: '24px', fontSize: '1.75rem' }}>History</h2>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
                <AnimatePresence mode="popLayout">
                    {entries.map((item) => {
                        const habits = item.habits || {};
                        const habitCount = Object.keys(habits).filter(k => k !== 'Junk Food' && habits[k]).length;
                        const isJunk = habits['Junk Food'];

                        return (
                            <motion.div
                                key={item.date}
                                variants={itemVariants}
                                layout
                                exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                                onClick={() => navigate(`/entry/${item.date}`)}
                                className="glass-panel"
                                style={{
                                    padding: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s ease', // Only animate non-layout props with CSS
                                    borderLeft: `4px solid ${isJunk ? 'var(--danger)' : 'var(--primary-500)'}`
                                }}
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(15, 23, 42, 0.75)' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                                            {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
                                        </h4>
                                        {item.weight && (
                                            <span style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.8rem',
                                                color: 'var(--text-main)',
                                                fontWeight: 600
                                            }}>
                                                {item.weight} kg
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            Habits: <strong style={{ color: 'var(--text-main)' }}>{habitCount}</strong>
                                        </span>
                                        <span style={{ width: '4px', height: '4px', background: 'currentColor', borderRadius: '50%' }} />
                                        <span>
                                            {isJunk ? <span style={{ color: '#f87171' }}>Junk 🍔</span> : <span style={{ color: '#34d399' }}>Clean 🥗</span>}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                        className="btn-ghost"
                                        style={{ padding: '8px', color: 'var(--text-muted)', minWidth: 'auto' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <ChevronRight size={20} color="var(--text-muted)" />
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
