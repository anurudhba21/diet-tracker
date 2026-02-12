import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export function useAggregatedData() {
    const { user } = useAuth();
    const [data, setData] = useState({
        profile: null,
        history: [],
        stats: null,
        loading: true
    });

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // 1. Fetch all entries
                const entries = await api.getEntries(user.id);

                // 2. Sort by date desc
                const sortedEntries = entries.sort((a, b) => new Date(b.date) - new Date(a.date));

                // 3. Calculate Stats
                const stats = calculateStats(sortedEntries);

                setData({
                    profile: user,
                    history: sortedEntries,
                    stats: stats,
                    loading: false
                });
            } catch (error) {
                console.error("Failed to aggregate data:", error);
                setData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchData();
    }, [user]);

    return data;
}

function calculateStats(entries) {
    if (!entries || entries.length === 0) return null;

    // 1. Adherence (Last 7 days)
    const last7Days = entries.slice(0, 7);
    const workoutsScheduled = 0; // TODO: needing workout schedule to calculate true adherence
    const workoutsCompleted = last7Days.filter(e => e.workouts && Object.values(e.workouts).some(w => w.completed)).length;

    // 2. Weight Trend
    const weights = entries.filter(e => e.weight).map(e => e.weight);
    const currentWeight = weights[0] || 0;
    const startWeight = weights[weights.length - 1] || 0;
    const weightLost = startWeight - currentWeight;

    return {
        workoutsCompletedLast7Days: workoutsCompleted,
        currentWeight,
        weightLost: weightLost.toFixed(1),
        totalEntries: entries.length
    };
}
