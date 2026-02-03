import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { analytics } from '../../utils/analytics';
import GoalSetup from './GoalSetup';
import WeightChart from './WeightChart';
import MetricCard from './MetricCard';
import StreakCard from './StreakCard';
import HabitStats from './HabitStats';
import ExportButton from './ExportButton';
import { TrendingUp, PlusCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AnalyticsDashboard() {
    const { user, updateProfile } = useAuth();
    const [goal, setGoal] = useState(null);
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [streaks, setStreaks] = useState(null);
    const [habitStats, setHabitStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasEntries, setHasEntries] = useState(false);
    const navigate = useNavigate();

    // Load data
    const refreshData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const savedGoal = await api.getGoal(user.id);
            const entriesArray = await api.getEntries(user.id);

            // Normalize entries for analytics utils
            const entriesMap = {};
            entriesArray.forEach(e => {
                entriesMap[e.date] = {
                    ...e,
                    ...e.meals,
                    junk_flag: e.habits?.['Junk Food'],
                    buttermilk_flag: e.habits?.['Buttermilk'],
                    omega3_flag: e.habits?.['Omega-3']
                };
            });

            setGoal(savedGoal);

            const latestEntry = entriesArray.find(e => e.weight) || {};
            const currentWeight = latestEntry.weight;

            if (savedGoal && entriesArray.length > 0) {
                const metrics = analytics.calculateProgress(savedGoal, currentWeight);
                setStats(metrics);

                const cData = analytics.prepareChartData(entriesMap, savedGoal);
                setChartData(cData);

                setHasEntries(cData.length > 0);
                setStreaks(analytics.calculateStreaks(entriesMap));
                setHabitStats(analytics.calculateHabitStats(entriesMap));
            } else {
                setHasEntries(false);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, [user]);

    const handleSaveGoal = async (goalData) => {
        await api.saveGoal({ ...goalData, userId: user.id });
        refreshData();
    };

    if (loading) return (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading your progress...
        </div>
    );

    if (!goal) {
        navigate('/profile');
        return null;
    }

    if (!hasEntries) {
        return (
            <div style={{ paddingBottom: '80px', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)', border: '2px dashed var(--color-border)' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'var(--color-bg)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-4)',
                        color: 'var(--color-primary)'
                    }}>
                        <TrendingUp size={32} />
                    </div>
                    <h2 style={{ marginBottom: 'var(--space-2)' }}>Ready to see progress?</h2>
                    <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
                        Your dashboard is waiting! Log your first weight entry to unlock charts, streaks, and metabolic tracking.
                    </p>
                    <button
                        className="btn"
                        onClick={() => navigate('/')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 auto' }}
                    >
                        <PlusCircle size={18} /> Log Your First Entry
                    </button>
                </div>

                <div className="card" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                    <h3 style={{ marginBottom: 'var(--space-4)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Weight Trend <span style={{ fontSize: '0.8rem', background: 'var(--color-border)', padding: '2px 8px', borderRadius: '4px' }}>Locked</span>
                    </h3>
                    <div style={{ height: '200px', background: 'var(--color-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p className="text-muted">Chart will appear after 2 entries</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', opacity: 0.5 }}>
                    <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Streaks</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>--</div>
                    </div>
                    <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Remaining</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>--</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '80px' }}>
            <StreakCard streaks={streaks} />

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)'
            }}>
                <MetricCard label="Current" value={stats?.current} unit="kg" isPrimary />
                <MetricCard label="Lost" value={stats?.lost} unit="kg" color="var(--color-primary-dark)" />
                <MetricCard label="Remaining" value={stats?.remaining} unit="kg" color="#f59e0b" />
            </div>

            <div className="card">
                <h3 style={{ marginBottom: 'var(--space-4)', fontSize: '1.1rem' }}>Weight Trend</h3>
                <WeightChart data={chartData} target={goal.targetWeight} />
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
                <MetricCard label="Total Progress" value={stats?.percent} unit="%" fullWidth />
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
                <HabitStats stats={habitStats} />
            </div>

            <div style={{ marginTop: 'var(--space-8)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'center' }}>
                <button
                    onClick={() => navigate('/profile')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    Adjust Goal
                </button>

                <ExportButton />
            </div>
        </div>
    );
}
