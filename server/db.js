import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

dotenv.config();

const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_MODE = process.env.VERCEL ? 'cloud' : (process.env.DB_MODE || 'local');
const dbPath = path.resolve(__dirname, 'diet_tracker.db');

let sqliteDb;
let supabase;

if (DB_MODE === 'cloud') {
    console.log('☁️ Database Mode: CLOUD (Supabase)');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        throw new Error('CRITICAL: Missing Supabase Configuration. Please set SUPABASE_URL and SUPABASE_KEY in environment variables.');
    }

    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
} else {
    console.log('🏠 Database Mode: LOCAL (SQLite)');
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
        if (err) console.error('Error opening database: ' + err.message);
    });

    sqliteDb.serialize(() => {
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE, password_hash TEXT, name TEXT, phone TEXT, height_cm INTEGER, dob TEXT, gender TEXT, avatar_id TEXT, created_at TEXT)`);
        sqliteDb.run(`ALTER TABLE users ADD COLUMN dob TEXT`, () => { });
        sqliteDb.run(`ALTER TABLE users ADD COLUMN gender TEXT`, () => { });
        sqliteDb.run(`ALTER TABLE users ADD COLUMN avatar_id TEXT`, () => { });

        sqliteDb.run(`CREATE TABLE IF NOT EXISTS daily_entries (id TEXT PRIMARY KEY, user_id TEXT, date TEXT, weight REAL, notes TEXT, junk INTEGER DEFAULT 0, UNIQUE(user_id, date))`);
        sqliteDb.run(`ALTER TABLE daily_entries ADD COLUMN junk INTEGER DEFAULT 0`, () => { });

        sqliteDb.run(`CREATE TABLE IF NOT EXISTS meals (id TEXT PRIMARY KEY, entry_id TEXT, type TEXT, content TEXT)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS habits (id TEXT PRIMARY KEY, entry_id TEXT, habit_name TEXT, completed INTEGER)`);

        // --- NEW: Workout Tables ---
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS workouts (id TEXT PRIMARY KEY, user_id TEXT, name TEXT, sets INTEGER, reps INTEGER, days TEXT)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS workout_logs (id TEXT PRIMARY KEY, entry_id TEXT, workout_id TEXT, completed INTEGER)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS workout_sets (id TEXT PRIMARY KEY, workout_log_id TEXT, set_number INTEGER, weight_kg REAL, reps INTEGER, completed INTEGER)`);

        sqliteDb.run(`CREATE TABLE IF NOT EXISTS user_habits (id TEXT PRIMARY KEY, user_id TEXT, name TEXT, time_of_day TEXT, active INTEGER)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS goals (user_id TEXT PRIMARY KEY, start_weight REAL, target_weight REAL, start_date TEXT)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS otps (phone TEXT PRIMARY KEY, code TEXT, expires_at INTEGER)`);
    });
}

// Unified Data Service
const db = {
    // --- Users ---
    async createUser(user) {
        if (DB_MODE === 'cloud') {
            const { data, error } = await supabase.from('users').insert(user).select().single();
            if (error) throw error;
            return data;
        } else {
            return new Promise((resolve, reject) => {
                const sql = `INSERT INTO users (id, email, password_hash, name, phone, height_cm, dob, gender, avatar_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                sqliteDb.run(sql, [user.id, user.email, user.password_hash, user.name, user.phone, user.height_cm, user.dob, user.gender, user.avatar_id, user.created_at], function (err) {
                    if (err) reject(err);
                    else resolve(user);
                });
            });
        }
    },

    async getUserByEmail(email) {
        if (DB_MODE === 'cloud') {
            const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        }
    },

    async getUserByPhone(phone) {
        if (DB_MODE === 'cloud') {
            const { data, error } = await supabase.from('users').select('*').eq('phone', phone).single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.get(`SELECT * FROM users WHERE phone = ?`, [phone], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        }
    },

    async getUserById(id) {
        if (DB_MODE === 'cloud') {
            const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        }
    },

    async updateUser(id, updates) {
        if (DB_MODE === 'cloud') {
            const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        } else {
            return new Promise((resolve, reject) => {
                const cols = Object.keys(updates).map(k => `${k} = ?`).join(', ');
                const vals = Object.values(updates);
                sqliteDb.run(`UPDATE users SET ${cols} WHERE id = ?`, [...vals, id], (err) => {
                    if (err) reject(err);
                    else sqliteDb.get(`SELECT * FROM users WHERE id = ?`, [id], (e, row) => resolve(row));
                });
            });
        }
    },

    // --- Entries ---
    async getEntries(userId) {
        if (DB_MODE === 'cloud') {
            // Include workout_sets in the fetch
            const { data, error } = await supabase.from('daily_entries')
                .select('*, meals(*), habits(*), workout_logs(*, workout_sets(*))')
                .eq('user_id', userId);

            if (error) throw error;
            return data.map(de => ({
                id: de.id,
                date: de.date,
                weight: de.weight,
                notes: de.notes,
                junk: de.junk,
                meals: de.meals.reduce((acc, m) => ({ ...acc, [m.type]: m.content }), {}),
                habits: de.habits.reduce((acc, h) => ({ ...acc, [h.habit_name]: h.completed }), {}),
                workouts: de.workout_logs.reduce((acc, w) => ({
                    ...acc,
                    [w.workout_id]: {
                        completed: !!w.completed,
                        sets: w.workout_sets ? w.workout_sets.sort((a, b) => a.set_number - b.set_number) : []
                    }
                }), {})
            }));
        } else {
            return new Promise((resolve, reject) => {
                // Modified SQL to include workout_logs
                // NOTE: SQLite complex join for sets is tricky with current flat reducer.
                // For MVP Local, we might just track completion or simplify.
                // Or better: Fetch basic entry data, then for each entry fetch sets?
                // Let's keep it simple for now: local only tracks completion until we do a bigger refactor.
                // Or, let's try to join.
                const sql = `
                    SELECT 
                        de.id as entry_id, de.date, de.weight, de.notes, de.junk, 
                        m.type as meal_type, m.content as meal_content, 
                        h.habit_name, h.completed as habit_completed,
                        wl.id as workout_log_id, wl.workout_id, wl.completed as workout_completed
                    FROM daily_entries de 
                    LEFT JOIN meals m ON de.id = m.entry_id 
                    LEFT JOIN habits h ON de.id = h.entry_id 
                    LEFT JOIN workout_logs wl ON de.id = wl.entry_id
                    WHERE de.user_id = ?
                `;
                sqliteDb.all(sql, [userId], (err, rows) => {
                    if (err) return reject(err);
                    const entries = {};
                    rows.forEach(row => {
                        if (!entries[row.date]) {
                            entries[row.date] = {
                                id: row.entry_id,
                                date: row.date,
                                weight: row.weight,
                                notes: row.notes,
                                junk: !!row.junk,
                                meals: {},
                                habits: {},
                                workouts: {}
                            };
                        }
                        if (row.meal_type) entries[row.date].meals[row.meal_type] = row.meal_content;
                        if (row.habit_name) entries[row.date].habits[row.habit_name] = !!row.habit_completed;
                        if (row.workout_id) {
                            // Local Only: Simple object for now, or fetch sets async? 
                            // Check if object exists
                            if (!entries[row.date].workouts[row.workout_id]) {
                                entries[row.date].workouts[row.workout_id] = {
                                    completed: !!row.workout_completed,
                                    sets: [] // sets not loaded in this query
                                };
                            }
                        }
                    });

                    // TODO: Load sets for local DB if needed. 
                    // For now, we return structure compatible with Cloud.
                    resolve(Object.values(entries));
                });
            });
        }
    },

    async saveEntry(entry) {
        const { userId, date, weight, notes, meals, habits, junk, workouts } = entry;
        const junkVal = junk ? 1 : 0;

        if (DB_MODE === 'cloud') {
            const { data: existing } = await supabase.from('daily_entries').select('id').eq('user_id', userId).eq('date', date).single();
            const id = existing?.id || crypto.randomUUID();

            const { data: de, error } = await supabase.from('daily_entries').upsert({ id, user_id: userId, date, weight, notes, junk: junkVal }).select().single();
            if (error) throw error;

            await supabase.from('meals').delete().eq('entry_id', de.id);
            if (meals) {
                const mealRows = Object.entries(meals).filter(([_, content]) => content).map(([type, content]) => ({ id: crypto.randomUUID(), entry_id: de.id, type, content }));
                if (mealRows.length) await supabase.from('meals').insert(mealRows);
            }

            await supabase.from('habits').delete().eq('entry_id', de.id);
            if (habits) {
                const habitRows = Object.entries(habits).map(([name, completed]) => ({ id: crypto.randomUUID(), entry_id: de.id, habit_name: name, completed }));
                if (habitRows.length) await supabase.from('habits').insert(habitRows);
            }

            // --- SAVE WORKOUT LOGS ---
            // First delete existing logs (cascades to sets)
            await supabase.from('workout_logs').delete().eq('entry_id', de.id);

            if (workouts) {
                for (const [wId, wData] of Object.entries(workouts)) {
                    // wData could be boolean (legacy) or object { completed, sets: [] }
                    let completed = false;
                    let sets = [];

                    if (typeof wData === 'boolean') {
                        completed = wData;
                    } else if (typeof wData === 'object') {
                        completed = wData.completed;
                        sets = wData.sets || [];
                    }

                    const workoutLogId = crypto.randomUUID();
                    const { error: logError } = await supabase.from('workout_logs').insert({
                        id: workoutLogId,
                        entry_id: de.id,
                        workout_id: wId,
                        completed: completed ? 1 : 0
                    });

                    if (logError) throw logError;

                    if (sets && sets.length > 0) {
                        const setRows = sets.map(s => ({
                            id: crypto.randomUUID(),
                            workout_log_id: workoutLogId,
                            set_number: s.set_number || s.setNumber,
                            weight_kg: s.weight_kg || s.weight,
                            reps: s.reps,
                            completed: s.completed ? true : false
                        }));
                        await supabase.from('workout_sets').insert(setRows);
                    }
                }
            }

            return de;
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.serialize(() => {
                    sqliteDb.get(`SELECT id FROM daily_entries WHERE user_id = ? AND date = ?`, [userId, date], (err, row) => {
                        if (err) return reject(err);
                        const id = row ? row.id : crypto.randomUUID();
                        if (!row) sqliteDb.run(`INSERT INTO daily_entries (id, user_id, date, weight, notes, junk) VALUES (?, ?, ?, ?, ?, ?)`, [id, userId, date, weight, notes, junkVal]);
                        else sqliteDb.run(`UPDATE daily_entries SET weight = ?, notes = ?, junk = ? WHERE id = ?`, [weight, notes, junkVal, id]);

                        sqliteDb.run(`DELETE FROM meals WHERE entry_id = ?`, [id], () => {
                            if (meals) {
                                const stmt = sqliteDb.prepare(`INSERT INTO meals (id, entry_id, type, content) VALUES (?, ?, ?, ?)`);
                                Object.entries(meals).forEach(([t, c]) => c && stmt.run(crypto.randomUUID(), id, t, c));
                                stmt.finalize();
                            }
                        });

                        sqliteDb.run(`DELETE FROM habits WHERE entry_id = ?`, [id], () => {
                            if (habits) {
                                const stmt = sqliteDb.prepare(`INSERT INTO habits (id, entry_id, habit_name, completed) VALUES (?, ?, ?, ?)`);
                                Object.entries(habits).forEach(([n, v]) => stmt.run(crypto.randomUUID(), id, n, v ? 1 : 0));
                                stmt.finalize();
                            }
                        });

                        // --- SAVE WORKOUT LOGS SQLITE ---
                        sqliteDb.run(`DELETE FROM workout_logs WHERE entry_id = ?`, [id], () => {
                            // This deletes logs. What about sets? 
                            // SQLite doesn't cascade by default unless configured.
                            // But since sets reference logs, we should delete them too?
                            // Or assuming cascade is ON?
                            // Safest: Delete sets for these logs first? No, easier to just delete.
                            // Let's assume broad delete.
                            // Actually, let's delete sets referencing logs for this entry... harder to do without proper cascading key or complex query.
                            // For MVP Local, we can iterate:
                            // Better: DELETE FROM workout_sets WHERE workout_log_id IN (SELECT id FROM workout_logs WHERE entry_id = ?)
                            sqliteDb.run(`DELETE FROM workout_sets WHERE workout_log_id IN (SELECT id FROM workout_logs WHERE entry_id = ?)`, [id], () => {
                                sqliteDb.run(`DELETE FROM workout_logs WHERE entry_id = ?`, [id], () => {
                                    if (workouts) {
                                        const logStmt = sqliteDb.prepare(`INSERT INTO workout_logs (id, entry_id, workout_id, completed) VALUES (?, ?, ?, ?)`);
                                        const setStmt = sqliteDb.prepare(`INSERT INTO workout_sets (id, workout_log_id, set_number, weight_kg, reps, completed) VALUES (?, ?, ?, ?, ?, ?)`);

                                        Object.entries(workouts).forEach(([wId, wData]) => {
                                            let completed = false;
                                            let sets = [];
                                            if (typeof wData === 'boolean') {
                                                completed = wData;
                                            } else if (typeof wData === 'object') {
                                                completed = wData.completed;
                                                sets = wData.sets || [];
                                            }

                                            const logId = crypto.randomUUID();
                                            logStmt.run(logId, id, wId, completed ? 1 : 0);

                                            sets.forEach(s => {
                                                setStmt.run(
                                                    crypto.randomUUID(),
                                                    logId,
                                                    s.set_number || s.setNumber,
                                                    s.weight_kg || s.weight,
                                                    s.reps,
                                                    s.completed ? 1 : 0
                                                );
                                            });
                                        });

                                        logStmt.finalize();
                                        setStmt.finalize();
                                    }
                                });
                            });
                        });

                        resolve({ id });
                    });
                });
            });
        }
    },

    async deleteEntry(id) {
        if (DB_MODE === 'cloud') {
            const { error } = await supabase.from('daily_entries').delete().eq('id', id);
            if (error) throw error;
            return true;
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.serialize(() => {
                    sqliteDb.run(`DELETE FROM meals WHERE entry_id = ?`, [id]);
                    sqliteDb.run(`DELETE FROM habits WHERE entry_id = ?`, [id]);
                    sqliteDb.run(`DELETE FROM workout_logs WHERE entry_id = ?`, [id]); // Clean up logs
                    sqliteDb.run(`DELETE FROM daily_entries WHERE id = ?`, [id], (err) => {
                        if (err) reject(err);
                        else resolve(true);
                    });
                });
            });
        }
    },

    // --- Workouts (Definitions) ---
    async getWorkouts(userId) {
        if (DB_MODE === 'cloud') {
            const { data, error } = await supabase.from('workouts').select('*').eq('user_id', userId);
            if (error) throw error;
            return data.map(w => ({ ...w, days: JSON.parse(w.days) }));
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.all(`SELECT * FROM workouts WHERE user_id = ?`, [userId], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows.map(w => ({ ...w, days: JSON.parse(w.days) })));
                });
            });
        }
    },

    async saveWorkout(workout) {
        // workout: { id, userId, name, sets, reps, days }
        const { id, userId, name, sets, reps, days } = workout;
        const daysStr = JSON.stringify(days);

        if (DB_MODE === 'cloud') {
            const workoutId = id || crypto.randomUUID();
            const { error } = await supabase.from('workouts').upsert({
                id: workoutId,
                user_id: userId,
                name,
                sets,
                reps,
                days: daysStr
            });
            if (error) throw error;
            return { id: workoutId };
        } else {
            return new Promise((resolve, reject) => {
                const newId = id || crypto.randomUUID();
                sqliteDb.run(`INSERT OR REPLACE INTO workouts (id, user_id, name, sets, reps, days) VALUES (?, ?, ?, ?, ?, ?)`,
                    [newId, userId, name, sets, reps, daysStr],
                    (err) => {
                        if (err) reject(err);
                        else resolve({ id: newId });
                    }
                );
            });
        }
    },

    async deleteWorkout(id) {
        if (DB_MODE === 'cloud') {
            const { error } = await supabase.from('workouts').delete().eq('id', id);
            if (error) throw error;
            return true;
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.run(`DELETE FROM workouts WHERE id = ?`, [id], (err) => {
                    if (err) reject(err);
                    else resolve(true);
                });
            });
        }
    },

    // --- User Habits ---
    async getUserHabits(userId) {
        if (DB_MODE === 'cloud') {
            const { data, error } = await supabase.from('user_habits').select('*').eq('user_id', userId);
            if (error) throw error;
            return data;
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.all(`SELECT * FROM user_habits WHERE user_id = ?`, [userId], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        }
    },

    async saveUserHabit(habit) {
        const { id, userId, name, timeOfDay, active } = habit;
        if (DB_MODE === 'cloud') {
            const habitId = id || crypto.randomUUID();
            const { error } = await supabase.from('user_habits').upsert({ id: habitId, user_id: userId, name, time_of_day: timeOfDay, active });
            if (error) throw error;
            return { id: habitId };
        } else {
            return new Promise((resolve, reject) => {
                const newId = id || crypto.randomUUID();
                const isActive = active === undefined ? 1 : (active ? 1 : 0);
                sqliteDb.run(`INSERT OR REPLACE INTO user_habits (id, user_id, name, time_of_day, active) VALUES (?, ?, ?, ?, ?)`,
                    [newId, userId, name, timeOfDay, isActive],
                    (err) => {
                        if (err) reject(err);
                        else resolve({ id: newId });
                    }
                );
            });
        }
    },

    async deleteUserHabit(id) {
        if (DB_MODE === 'cloud') {
            const { error } = await supabase.from('user_habits').delete().eq('id', id);
            if (error) throw error;
            return true;
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.run(`DELETE FROM user_habits WHERE id = ?`, [id], (err) => {
                    if (err) reject(err);
                    else resolve(true);
                });
            });
        }
    },

    // --- Goals ---
    async getGoal(userId) {
        if (DB_MODE === 'cloud') {
            const { data, error } = await supabase.from('goals').select('*').eq('user_id', userId).single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.get(`SELECT * FROM goals WHERE user_id = ?`, [userId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        }
    },

    async saveGoal(goal) {
        if (DB_MODE === 'cloud') {
            const { error } = await supabase.from('goals').upsert({ user_id: goal.userId, start_weight: goal.startWeight, target_weight: goal.targetWeight, start_date: goal.startDate });
            if (error) throw error;
            return true;
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.run(`INSERT OR REPLACE INTO goals (user_id, start_weight, target_weight, start_date) VALUES (?, ?, ?, ?)`, [goal.userId, goal.startWeight, goal.targetWeight, goal.startDate], (err) => {
                    if (err) reject(err);
                    else resolve(true);
                });
            });
        }
    },

    // --- OTPs ---
    async saveOTP(phone, code) {
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
        if (DB_MODE === 'cloud') {
            const { error } = await supabase.from('otps').upsert({ phone, code, expires_at: expiresAt });
            if (error) throw error;
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.run(`INSERT OR REPLACE INTO otps (phone, code, expires_at) VALUES (?, ?, ?)`, [phone, code, expiresAt], (err) => {
                    if (err) reject(err);
                    else resolve(true);
                });
            });
        }
    },

    async verifyOTP(phone, code) {
        const now = Date.now();
        if (DB_MODE === 'cloud') {
            const { data, error } = await supabase.from('otps').select('*').eq('phone', phone).single();
            if (error || !data) return false;
            if (data.code !== code || data.expires_at < now) return false;
            await supabase.from('otps').delete().eq('phone', phone);
            return true;
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.get(`SELECT * FROM otps WHERE phone = ?`, [phone], (err, row) => {
                    if (err || !row) return resolve(false);
                    if (row.code !== code || row.expires_at < now) return resolve(false);
                    sqliteDb.run(`DELETE FROM otps WHERE phone = ?`, [phone], () => resolve(true));
                });
            });
        }
    }
};

export default db;
