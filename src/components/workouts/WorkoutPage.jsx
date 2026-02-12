import { useState, useEffect } from 'react';
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
    const [showManager, setShowManager] = useState(false);
    const [viewMode, setViewMode] = useState('checklist'); // 'checklist' | 'stats'

    // AI Analysis State
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const changeDate = (days) => {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        setDate(d.toISOString().split('T')[0]);
    };

    const handleAnalyze = async () => {
        setAnalyzing(true);
        setAnalysisResult(null);
        try {
            // Simulate context for AI
            const context = {
                type: 'WORKOUT_ANALYSIS',
                data: {
                    date,
                    completed: entry.workouts
                        ? Object.values(entry.workouts).filter(v => v).length
                        : 0,
                }
            };
            const response = await chatService.processMessage("Analyze my workout", context);
            if (response.analysis) {
                setAnalysisResult(response.analysis);
            }
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setAnalyzing(false);
        }
    };

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
                    {/* We could add the AI Analysis button here too */}
                </div>
            )}

            {/* Checklist View */}
            {viewMode === 'checklist' && (
                <div style={{ marginBottom: '24px' }}>
                    {/* AI Analysis Button (Only in Checklist for now or move to verify) */}
                    <motion.div
                        className="glass-panel"
                        style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))' }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '10px', background: 'var(--primary-glow)', borderRadius: '12px', color: '#fff' }}>
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>AI Workout Coach</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get insights on your routine</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="btn-sm"
                            style={{ background: 'var(--primary-500)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            {analyzing ? 'Analyzing...' : 'Analyze'}
                        </button>
                    </motion.div>

                    {/* Analysis Result */}
                    <AnimatePresence>
                        {analysisResult && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="glass-panel"
                                style={{ marginBottom: '24px', padding: '20px', borderLeft: '4px solid var(--primary-500)' }}
                            >
                                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Coach Insights</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Adherence</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary-400)' }}>{analysisResult.adherence}%</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trend</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{analysisResult.trend}</div>
                                    </div>
                                </div>
                                <p style={{ margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>{analysisResult.recommendation}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

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

                    {entryLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
                    ) : (
                        <>
                            <WorkoutChecklist date={date} entry={entry} updateEntry={updateEntry} />

                            {/* Save Button */}
                            <div style={{ marginTop: '32px' }}>
                                <button
                                    className="btn"
                                    onClick={async () => {
                                        const result = await saveEntry();
                                        if (result.success) {
                                            // Optional: Handle success (e.g. feedback)
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
                    )}
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
