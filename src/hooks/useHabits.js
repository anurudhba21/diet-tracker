import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export function useHabits() {
    const { user } = useAuth();
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        if (!user) return;
        fetchHabits();

        // Check permission status on load
        if ('Notification' in window && Notification.permission === 'granted') {
            setNotificationsEnabled(true);
        }
    }, [user]);

    // Reminder Logic
    useEffect(() => {
        if (!notificationsEnabled || habits.length === 0) return;

        const checkReminders = () => {
            const now = new Date();
            const hour = now.getHours();
            let timeOfDay = 'any';

            if (hour >= 6 && hour < 12) timeOfDay = 'morning';
            else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
            else if (hour >= 18 && hour < 22) timeOfDay = 'evening';

            // In a real app, we would check if habits for this time are already done.
            // For this MVP, we will only log that a check occurred to console 
            // to avoid spamming the user if they keep the tab open.
            console.log(`Checking reminders for ${timeOfDay}...`);
        };

        const interval = setInterval(checkReminders, 60 * 60 * 1000); // Check every hour
        return () => clearInterval(interval);
    }, [notificationsEnabled, habits]);

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notifications');
            return false;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            setNotificationsEnabled(true);
            new Notification('Diet Tracker', {
                body: 'Reminders enabled! We will notify you to track your habits.',
                icon: '/icon.png'
            });
            return true;
        }
        return false;
    };

    const fetchHabits = async () => {
        try {
            setLoading(true);
            const data = await api.getHabits(user.id);

            // Seed defaults if empty
            if (data.length === 0) {
                await seedDefaults();
            } else {
                setHabits(data);
            }
        } catch (error) {
            console.error('Failed to fetch habits', error);
        } finally {
            setLoading(false);
        }
    };

    const seedDefaults = async () => {
        const defaults = [
            { name: 'Junk Food', timeOfDay: 'any', active: true },
            { name: 'Buttermilk', timeOfDay: 'afternoon', active: true },
            { name: 'Omega-3', timeOfDay: 'morning', active: true }
        ];

        try {
            const promises = defaults.map(h => api.saveHabit({ ...h, userId: user.id }));
            await Promise.all(promises);
            // Re-fetch to get IDs
            const data = await api.getHabits(user.id);
            setHabits(data);
        } catch (error) {
            console.error('Failed to seed default habits', error);
        }
    };

    const addHabit = async (name, timeOfDay) => {
        try {
            await api.saveHabit({
                userId: user.id,
                name,
                timeOfDay,
                active: true
            });
            fetchHabits(); // Refresh list
            return true;
        } catch (error) {
            console.error('Failed to add habit', error);
            return false;
        }
    };

    const removeHabit = async (id) => {
        try {
            await api.deleteHabit(id);
            setHabits(prev => prev.filter(h => h.id !== id));
            return true;
        } catch (error) {
            console.error('Failed to remove habit', error);
            return false;
        }
    };

    return {
        habits,
        loading,
        addHabit,
        removeHabit,
        refreshHabits: fetchHabits,
        notificationsEnabled,
        requestNotificationPermission
    };
}
