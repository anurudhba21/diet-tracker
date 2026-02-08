import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { analytics } from '../../utils/analytics';
import GoalSetup from './GoalSetup';
import WeightChart from './WeightChart';
import DailyProgressChart from './DailyProgressChart';
import GoalPieChart from './GoalPieChart';
import PredictionCard from './PredictionCard';
import HabitImpactCard from './HabitImpactCard';
import MetricCard from './MetricCard';
import StreakCard from './StreakCard';
import HabitStats from './HabitStats';
import BMICard from './BMICard';
import CalendarHeatmap from './CalendarHeatmap';
import AchievementsCard from './AchievementsCard';
import ExportButton from './ExportButton';
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

export default function AnalyticsDashboard() {
    const { user, updateProfile } = useAuth();
    const [goal, setGoal] = useState(null);
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [dailyProgressData, setDailyProgressData] = useState([]);
    const [goalPieData, setGoalPieData] = useState([]);
    const [prediction, setPrediction] = useState(null);
    const [habitImpact, setHabitImpact] = useState(null);
    const [streaks, setStreaks] = useState(null);
    const [bmi, setBmi] = useState(null);
    const [habitStats, setHabitStats] = useState(null);
    const [heatmapEntries, setHeatmapEntries] = useState({});
    const [loading, setLoading] = useState(true);
    const [hasEntries, setHasEntries] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
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

                const cData = analytics.prepareChartData(entriesMap, savedGoal);
                setChartData(cData);

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
                    <h2 className="text-gradient" style={{ marginBottom: '8px', fontSize: '1.75rem' }}>Ready to Climb?</h2>
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
                    { value: 'overview', label: 'Overview' },
                    { value: 'trends', label: 'Trends' },
                    { value: 'insights', label: 'Insights' },
                    { value: 'journey', label: 'Journey' }
                ]}
            />

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <MetricCard label="Current" value={stats?.current} unit="kg" isPrimary />
                            <MetricCard label="Today's Change" value={dailyProgressData[dailyProgressData.length - 1]?.loss || '--'} unit="kg" color={dailyProgressData[dailyProgressData.length - 1]?.loss > 0 ? 'var(--primary-500)' : 'var(--danger)'} />
                        </motion.div>

                        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <BMICard bmi={bmi} />
                            <StreakCard streaks={streaks} />
                        </motion.div>

                        <motion.div variants={itemVariants} className="glass-panel" style={{ marginBottom: '24px' }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrendingDown className="text-primary" size={20} /> Recent Trend
                            </h3>
                            <div style={{ height: '200px' }}>
                                <WeightChart data={chartData.slice(-7)} target={goal.targetWeight} />
                            </div>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn"
                            onClick={() => navigate('/')}
                            style={{ marginTop: 'auto' }}
                        >
                            <PlusCircle size={20} /> Log Today's Weight
                        </motion.button>
                    </motion.div>
                )}

                {activeTab === 'trends' && (
                    <motion.div
                        key="trends"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                    >
                        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <MetricCard label="Total Lost" value={stats?.lost} unit="kg" color="var(--primary-600)" />
                            <MetricCard label="Remaining" value={stats?.remaining} unit="kg" color="var(--accent-gold)" />
                        </motion.div>

                        <motion.div variants={itemVariants} className="glass-panel">
                            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <TrendingDown className="text-primary" size={24} /> Weight History
                            </h3>
                            <WeightChart data={chartData} target={goal.targetWeight} />
                        </motion.div>

                        <motion.div variants={itemVariants} className="glass-panel">
                            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ArrowRight className="text-primary" size={24} /> Daily Fluctuations
                            </h3>
                            <DailyProgressChart data={dailyProgressData} />
                        </motion.div>

                        <motion.div variants={itemVariants} className="glass-panel">
                            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Target className="text-primary" size={24} /> Goal Progress
                            </h3>
                            <GoalPieChart data={goalPieData} />
                        </motion.div>
                    </motion.div>
                )}

                {activeTab === 'insights' && (
                    <motion.div
                        key="insights"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                    >
                        <PredictionCard prediction={prediction} />
                        <HabitImpactCard impactData={habitImpact} />
                        <HabitStats stats={habitStats} />

                        <div className="glass-panel" style={{ opacity: 0.5, textAlign: 'center', padding: '32px' }}>
                            <p className="text-muted">More AI insights coming soon...</p>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'journey' && (
                    <motion.div
                        key="journey"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                    >
                        <AchievementsCard stats={stats} streaks={streaks} />
                        <CalendarHeatmap entries={heatmapEntries} />

                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <ExportButton />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
