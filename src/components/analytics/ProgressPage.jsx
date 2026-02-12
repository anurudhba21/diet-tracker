import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { analytics } from '../../utils/analytics';
import GoalSetup from './GoalSetup';
import WeightChart from './WeightChart';

import DailyProgressChart from './DailyProgressChart';
import GoalPieChart from './GoalPieChart';
import PredictionCard from './PredictionCard';
import ResilienceCard from './ResilienceCard';

import HabitImpactCard from './HabitImpactCard';
import MetricCard from './MetricCard';
import StreakCard from './StreakCard';
import HabitStats from './HabitStats';
import BMICard from './BMICard';
import CalendarHeatmap from './CalendarHeatmap';
import AchievementsCard from './AchievementsCard';
import ExportButton from './ExportButton';
import WorkoutStats from './WorkoutStats';
import { TrendingUp, TrendingDown, PlusCircle, ArrowRight, Target, PieChart as PieChartIcon, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SegmentedControl from './SegmentedControl';

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

export default function ProgressPage() {
    const { user, updateProfile } = useAuth();
    const [goal, setGoal] = useState(null);
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [dailyProgressData, setDailyProgressData] = useState([]);
    const [goalPieData, setGoalPieData] = useState([]);
    const [prediction, setPrediction] = useState(null);
    const [resilience, setResilience] = useState(null);

    const [habitImpact, setHabitImpact] = useState(null);
    const [streaks, setStreaks] = useState(null);
    const [bmi, setBmi] = useState(null);
    const [habitStats, setHabitStats] = useState(null);
    const [heatmapEntries, setHeatmapEntries] = useState({});
    const [loading, setLoading] = useState(true);
    const [hasEntries, setHasEntries] = useState(false);
    const [activeTab, setActiveTab] = useState('meals');
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

            // Find latest entry with weight
            // entriesArray is not guaranteed sorted here, so let's sort first to find latest
            const sortedEntries = entriesArray.sort((a, b) => new Date(b.date) - new Date(a.date));
            const latestEntry = sortedEntries.find(e => e.weight) || {};
            const currentWeight = latestEntry.weight;

            if (savedGoal && entriesArray.length > 0) {
                const metrics = analytics.calculateProgress(savedGoal, currentWeight);
                setStats(metrics);

                const trueWeightMap = analytics.calculateTrueWeight(entriesMap);

                // Prepare chart data with True Weight
                const cData = entriesArray
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(e => ({
                        date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        weight: parseFloat(e.weight),
                        trueWeight: trueWeightMap[e.date],
                        target: savedGoal ? parseFloat(savedGoal.targetWeight) : null
                    }))
                    .filter(e => !isNaN(e.weight));

                setChartData(cData);

                // Resilience
                setResilience(analytics.calculateResilience(entriesMap));


                const dpData = analytics.prepareDailyProgressData(entriesMap, savedGoal);
                setDailyProgressData(dpData);

                const pieData = analytics.prepareGoalPieData(savedGoal, currentWeight);
                setGoalPieData(pieData);

                const pred = analytics.predictGoalDate(entriesMap, savedGoal);
                setPrediction(pred);



                setHabitImpact(analytics.analyzeHabitImpact(entriesMap));

                setHasEntries(cData.length > 0);
                setStreaks(analytics.calculateStreaks(entriesMap));
                setHabitStats(analytics.calculateHabitStats(entriesMap));
                setHeatmapEntries(entriesMap);
                if (user.height_cm) {
                    setBmi(analytics.calculateBMI(currentWeight, user.height_cm));
                }
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
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ paddingBottom: '90px', display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
                <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 24px', border: '1px solid var(--primary-500)', boxShadow: '0 0 40px rgba(16, 185, 129, 0.1)' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        color: 'var(--primary-500)',
                        border: '1px solid var(--primary-500)'
                    }}>
                        <TrendingUp size={40} />
                    </div>
                    <div>
                        <h1 className="text-gradient" style={{ margin: 0, fontSize: '1.8rem' }}>Progress</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tracking your achievements</p>
                    </div>
                    <p className="text-muted" style={{ marginBottom: '32px', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
                        Your personal dashboard is waiting! Log your first weight entry to unlock charts, streaks, and metabolic tracking.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn"
                        onClick={() => navigate('/')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 auto', maxWidth: '250px' }}
                    >
                        <PlusCircle size={20} /> Log First Entry
                    </motion.button>
                </div>

                <div className="glass-panel" style={{ opacity: 0.6, pointerEvents: 'none', filter: 'grayscale(100%)' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={20} /> Weight Trend <span style={{ fontSize: '0.7rem', background: 'var(--glass-border)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={10} /> LOCKED</span>
                    </h3>
                    <div style={{ height: '200px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--glass-border)' }}>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>Chart unlocks after 2 entries</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', opacity: 0.6 }}>
                    <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                        <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Streaks</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', lineHeight: 1, marginTop: '8px', color: 'var(--text-dim)' }}>--</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                        <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Remaining</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', lineHeight: 1, marginTop: '8px', color: 'var(--text-dim)' }}>--</div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            style={{ paddingBottom: '100px' }}
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <SegmentedControl
                value={activeTab}
                onChange={setActiveTab}
                options={[
                    { value: 'meals', label: 'Meals & Weight' },
                    { value: 'workouts', label: 'Workouts' }
                ]}
            />

            <AnimatePresence mode="wait">
                {activeTab === 'meals' && (
                    <motion.div
                        key="meals"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                    >
                        {/* Summary Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <MetricCard label="Current" value={stats?.current} unit="kg" isPrimary />
                            <MetricCard label="Total Lost" value={stats?.lost} unit="kg" color="var(--primary-600)" />
                        </div>

                        {/* Weight Trends */}
                        <div className="glass-panel">
                            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <TrendingDown className="text-primary" size={24} /> Weight History
                            </h3>
                            <div style={{ height: '300px' }}>
                                <WeightChart data={chartData} target={goal.targetWeight} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <BMICard bmi={bmi} />
                            <GoalPieChart data={goalPieData} />
                        </div>

                        <PredictionCard prediction={prediction} />

                        <div className="glass-panel">
                            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ArrowRight className="text-primary" size={24} /> Daily Fluctuations
                            </h3>
                            <div style={{ height: '300px' }}>
                                <DailyProgressChart data={dailyProgressData} />
                            </div>
                        </div>

                        <HabitImpactCard impactData={habitImpact} />
                        <HabitStats stats={habitStats} />

                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <ExportButton />
                        </div>
                    </motion.div>
                )}

                {activeTab === 'workouts' && (
                    <motion.div
                        key="workouts"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                    >
                        <WorkoutStats />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <StreakCard streaks={streaks} />
                            <MetricCard label="Consistency" value={stats?.consistency || '0'} unit="%" color="var(--accent-gold)" />
                        </div>

                        <ResilienceCard data={resilience} />
                        <CalendarHeatmap entries={heatmapEntries} />
                        <AchievementsCard stats={stats} streaks={streaks} />

                        {/* AI Advisor Modal/Button could go here if moving analysis */}
                        <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))', padding: '24px', textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 8px 0' }}>AI Advisor</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Get a deep dive into your training data and habits.</p>
                            <button
                                onClick={() => navigate('/workouts')}
                                className="btn-sm"
                                style={{ background: 'var(--primary-500)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px' }}
                            >
                                Open AI Coach
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
