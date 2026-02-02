import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';
import { analytics } from '../../utils/analytics';
import GoalSetup from './GoalSetup';
import HeightSetup from './HeightSetup';
import WeightChart from './WeightChart';
import MetricCard from './MetricCard';
import StreakCard from './StreakCard';
import HabitStats from './HabitStats';
import ExportButton from './ExportButton';

export default function AnalyticsDashboard() {
    const { user, updateProfile } = useAuth();
    const [goal, setGoal] = useState(null);
    const [stats, setStats] = useState(null);
    const [bmi, setBmi] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [streaks, setStreaks] = useState(null);
    const [habitStats, setHabitStats] = useState(null);

    // Load data
    const refreshData = () => {
        if (!user) return;
        const savedGoal = storage.getGoal(user.id);
        const entries = storage.getAllEntries(user.id);

        // Convert array back to object for analytics calc
        const entriesMap = storage.getEntries(user.id);

        setGoal(savedGoal);

        if (savedGoal && entries.length > 0) {
            // Find latest weight entry
            const latestEntry = entries.find(e => e.weight) || {};
            const metrics = analytics.calculateProgress(savedGoal, latestEntry.weight);
            setStats(metrics);

            // Calculate BMI
            if (user.height_cm && metrics?.current) {
                setBmi(analytics.calculateBMI(metrics.current, user.height_cm));
            }

            const cData = analytics.prepareChartData(entriesMap, savedGoal);
            setChartData(cData);

            // New: Streaks & Habits
            setStreaks(analytics.calculateStreaks(entriesMap));
            setHabitStats(analytics.calculateHabitStats(entriesMap));
        }
    };

    useEffect(() => {
        refreshData();
    }, [user]); // Re-run when user profile (height) changes

    const handleSaveHeight = (heightCm) => {
        updateProfile({ height_cm: heightCm });
        // The useEffect dependency on 'user' will trigger storage refresh
    };

    if (!goal) {
        return <GoalSetup onSave={refreshData} />;
    }

    return (
        <div style={{ paddingBottom: '80px' }}>
            {/* Height Prompt */}
            {!user.height_cm && <HeightSetup onSave={handleSaveHeight} />}

            <StreakCard streaks={streaks} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <MetricCard label="Current" value={stats?.current} unit="kg" />
                {bmi ? (
                    <MetricCard
                        label="BMI"
                        value={bmi.value}
                        unit={bmi.category}
                        color={bmi.color}
                    />
                ) : (
                    <MetricCard label="BMI" value="--" unit="" />
                )}
                <MetricCard label="Lost" value={stats?.lost} unit="kg" color="var(--color-primary-dark)" />
                <MetricCard label="Remaining" value={stats?.remaining} unit="kg" color="#f59e0b" />
                <MetricCard label="Progress" value={stats?.percent} unit="%" />
            </div>

            <WeightChart data={chartData} target={goal.targetWeight} />

            <div style={{ marginTop: 'var(--space-4)' }}>
                <HabitStats stats={habitStats} />
            </div>

            <div style={{ marginTop: 'var(--space-4)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'center' }}>
                <button
                    onClick={() => setGoal(null)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        textDecoration: 'underline',
                        cursor: 'pointer'
                    }}
                >
                    Adjust Goal
                </button>

                <ExportButton />
            </div>
        </div>
    );
}
