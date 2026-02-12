import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, Calendar, Dumbbell, BarChart3, CheckCircle } from 'lucide-react';
import { useDailyEntry } from '../../hooks/useDailyEntry';
import WorkoutChecklist from './WorkoutChecklist';
import WorkoutManager from './WorkoutManager';
import { api } from '../../utils/api';
// Assuming api is needed for AI or we use chatService directly. 
// Actually DailyEntry used chatService for analysis.
import { chatService } from '../../utils/chatService';

import WorkoutStats from '../analytics/WorkoutStats';

export default function WorkoutPage() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const { entry, updateEntry, saveEntry, isSaved, loading: entryLoading } = useDailyEntry(date);
    const [isEditing, setIsEditing] = useState(true);

    // Sync editing state with data existence
    useEffect(() => {
        if (!entryLoading) {
            const hasWorkouts = entry.workouts && Object.keys(entry.workouts).length > 0;
            setIsEditing(!hasWorkouts);
        }
    }, [entryLoading, entry.workouts]);

    const changeDate = (days) => {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        setDate(d.toISOString().split('T')[0]);
        // Reset analysis when date changes
        setAnalysisResult(null);
    };

    // Calculate Summary Metrics
    const summary = useMemo(() => {
        if (!entry.workouts) return { exercises: 0, sets: 0, volume: 0 };
        const workoutData = Object.values(entry.workouts);
        const exercises = workoutData.length;
        let totalSets = 0;
        let totalVolume = 0;

        workoutData.forEach(w => {
            if (w.sets && Array.isArray(w.sets)) {
                totalSets += w.sets.length;
                w.sets.forEach(s => {
                    const weight = parseFloat(s.weight_kg || s.weight || 0);
                    const reps = parseInt(s.reps || 0);
                    totalVolume += weight * reps;
                });
            }
        });

        return { exercises, sets: totalSets, volume: Math.round(totalVolume) };
    }, [entry.workouts]);

    // ... handleAnalyze implementation ...

    // ... handleAnalyze implementation ...


    if (entryLoading) {
        return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>;
    }

    // Summary View
    if (!isEditing && entry.workouts && Object.keys(entry.workouts).length > 0) {
        return (
            <div className="page-container" style={{ paddingBottom: '100px' }}>
                <header style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--glass-bg)', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                        <button onClick={() => changeDate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                            <ChevronLeft size={20} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 500 }}>
                            <Calendar size={16} style={{ color: 'var(--primary-400)' }} />
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <button onClick={() => changeDate(1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </header>

                <div style={{ padding: '0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 24px', width: '100%', maxWidth: '400px' }}>
                        <div style={{
                            color: 'var(--secondary-500)',
                            marginBottom: '24px',
                            display: 'flex',
                            justifyContent: 'center',
                            filter: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.3))'
                        }}>
                            <CheckCircle size={80} />
                        </div>
                        <h2 className="text-gradient" style={{ marginBottom: '8px', fontSize: '2rem' }}>Session Summary</h2>
                        <p style={{ marginBottom: '32px', color: 'var(--text-muted)' }}>
                            Great workout on <br />
                            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{new Date(date).toDateString()}</span>
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>Exercises</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{summary.exercises}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>Sets</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{summary.sets}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>Volume</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{summary.volume} <span style={{ fontSize: '0.7rem' }}>kg</span></div>
                            </div>
                        </div>

                        <div style={{
                            marginBottom: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            padding: '16px',
                            borderRadius: '16px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                            <Dumbbell size={20} className="text-secondary" />
                            <span style={{ fontWeight: 700, color: '#34d399' }}>Strong Session!</span>
                        </div>

                        <button
                            className="btn-ghost"
                            onClick={() => setIsEditing(true)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <Plus size={18} /> Edit Session
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ paddingBottom: '80px' }}>
            {/* Header / Date Nav */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div>
                    <h1 className="text-gradient" style={{ margin: 0, fontSize: '1.8rem' }}>Workouts</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Build your strength</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--glass-bg)', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                    <button onClick={() => changeDate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 500 }}>
                        <Calendar size={16} style={{ color: 'var(--primary-400)' }} />
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <button onClick={() => changeDate(1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </header>

            {/* View Toggle */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => setViewMode('checklist')}
                    className={`btn-sm ${viewMode === 'checklist' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{
                        flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        background: viewMode === 'checklist' ? 'var(--primary-600)' : 'rgba(255,255,255,0.05)'
                    }}
                >
                    <Dumbbell size={18} /> Today's Plan
                </button>
                <button
                    onClick={() => setViewMode('stats')}
                    className={`btn-sm ${viewMode === 'stats' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{
                        flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        background: viewMode === 'stats' ? 'var(--primary-600)' : 'rgba(255,255,255,0.05)'
                    }}
                >
                    <BarChart3 size={18} /> Analytics
                </button>
            </div>

            {/* Stats View */}
            {viewMode === 'stats' && (
                <div style={{ marginBottom: '24px' }}>
                    <WorkoutStats />
                </div>
            )}

            {/* Checklist View */}
            {viewMode === 'checklist' && (
                <div style={{ marginBottom: '24px' }}>
                    {/* ... (AI analysis parts) ... */}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Today's Plan</h2>
                        <button
                            onClick={() => setShowManager(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: 'none', border: '1px solid var(--text-muted)',
                                color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '20px',
                                fontSize: '0.85rem', cursor: 'pointer'
                            }}
                        >
                            <Plus size={16} /> Manage Routine
                        </button>
                    </div>

                    <>
                        <WorkoutChecklist date={date} entry={entry} updateEntry={updateEntry} />

                        {/* Save Button */}
                        <div style={{ marginTop: '32px' }}>
                            <button
                                className="btn"
                                onClick={async () => {
                                    const result = await saveEntry();
                                    if (result.success) {
                                        setIsEditing(false);
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    background: isSaved ? 'var(--primary-600)' : 'linear-gradient(135deg, var(--primary-500), var(--primary-600))'
                                }}
                            >
                                {isSaved ? <CheckCircle size={18} /> : null}
                                {isSaved ? 'Session Saved!' : 'Save Session'}
                            </button>
                        </div>
                    </>
                </div>
            )}

            {/* Manager Modal */}
            <AnimatePresence>
                {showManager && (
                    <WorkoutManager onClose={() => setShowManager(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
