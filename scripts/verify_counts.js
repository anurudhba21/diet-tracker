
import { createClient } from '@supabase/supabase-js';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../server/.env');
dotenv.config({ path: envPath });

const dbPath = path.resolve(__dirname, '../server/diet_tracker.db');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const sqlite = new sqlite3.Database(dbPath);

async function checkCounts() {
    const tables = ['users', 'daily_entries', 'meals', 'habits', 'workouts', 'workout_logs'];

    console.log('📊 Comparing Counts (Local vs Cloud)...');

    for (const table of tables) {
        const localCount = await new Promise(r => sqlite.get(`SELECT COUNT(*) as c FROM ${table}`, (e, row) => r(row.c)));
        const { count: cloudCount, error } = await supabase.from(table).select('*', { count: 'exact', head: true });

        if (error) console.log(`   ❌ Cloud Error for ${table}: ${error.message}`);
        else console.log(`   ${table}: Local=${localCount} | Cloud=${cloudCount}  ${localCount === cloudCount ? '✅' : '⚠️'}`);
    }
    sqlite.close();
}

checkCounts();
