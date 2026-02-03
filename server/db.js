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
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS daily_entries (id TEXT PRIMARY KEY, user_id TEXT, date TEXT, weight REAL, notes TEXT, UNIQUE(user_id, date))`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS meals (id TEXT PRIMARY KEY, entry_id TEXT, type TEXT, content TEXT)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS habits (id TEXT PRIMARY KEY, entry_id TEXT, habit_name TEXT, completed INTEGER)`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS goals (user_id TEXT PRIMARY KEY, start_weight REAL, target_weight REAL, start_date TEXT)`);
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
            const { data, error } = await supabase.from('daily_entries').select('*, meals(*), habits(*)').eq('user_id', userId);
            if (error) throw error;
            return data.map(de => ({
                id: de.id,
                date: de.date,
                weight: de.weight,
                notes: de.notes,
                meals: de.meals.reduce((acc, m) => ({ ...acc, [m.type]: m.content }), {}),
                habits: de.habits.reduce((acc, h) => ({ ...acc, [h.habit_name]: h.completed }), {})
            }));
        } else {
            return new Promise((resolve, reject) => {
                const sql = `SELECT de.id as entry_id, de.date, de.weight, de.notes, m.type as meal_type, m.content as meal_content, h.habit_name, h.completed as habit_completed FROM daily_entries de LEFT JOIN meals m ON de.id = m.entry_id LEFT JOIN habits h ON de.id = h.entry_id WHERE de.user_id = ?`;
                sqliteDb.all(sql, [userId], (err, rows) => {
                    if (err) return reject(err);
                    const entries = {};
                    rows.forEach(row => {
                        if (!entries[row.date]) {
                            entries[row.date] = { id: row.entry_id, date: row.date, weight: row.weight, notes: row.notes, meals: {}, habits: {} };
                        }
                        if (row.meal_type) entries[row.date].meals[row.meal_type] = row.meal_content;
                        if (row.habit_name) entries[row.date].habits[row.habit_name] = !!row.habit_completed;
                    });
                    resolve(Object.values(entries));
                });
            });
        }
    },

    async saveEntry(entry) {
        const { userId, date, weight, notes, meals, habits } = entry;
        if (DB_MODE === 'cloud') {
            const { data: de, error } = await supabase.from('daily_entries').upsert({ user_id: userId, date, weight, notes }, { onConflict: 'user_id,date' }).select().single();
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
            return de;
        } else {
            return new Promise((resolve, reject) => {
                sqliteDb.serialize(() => {
                    sqliteDb.get(`SELECT id FROM daily_entries WHERE user_id = ? AND date = ?`, [userId, date], (err, row) => {
                        if (err) return reject(err);
                        const id = row ? row.id : crypto.randomUUID();
                        if (!row) sqliteDb.run(`INSERT INTO daily_entries (id, user_id, date, weight, notes) VALUES (?, ?, ?, ?, ?)`, [id, userId, date, weight, notes]);
                        else sqliteDb.run(`UPDATE daily_entries SET weight = ?, notes = ? WHERE id = ?`, [weight, notes, id]);

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
                    sqliteDb.run(`DELETE FROM daily_entries WHERE id = ?`, [id], (err) => {
                        if (err) reject(err);
                        else resolve(true);
                    });
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
    }
};

export default db;
