
import sqlite3 from 'sqlite3';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../server/.env');
console.log('📄 Loading .env from:', envPath);
dotenv.config({ path: envPath });

const dbPath = path.resolve(__dirname, '../server/diet_tracker.db');

console.log('📦 Starting Migration...');
console.log('📂 Local DB:', dbPath);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const sqlite = new sqlite3.Database(dbPath);

const tables = [
    'users',
    'goals',
    'user_habits',
    'daily_entries',
    'meals',
    'habits',
    'workouts',
    'workout_logs'
];

async function migrate() {
    for (const table of tables) {
        console.log(`\n🔄 Migrating ${table}...`);

        const rows = await new Promise((resolve, reject) => {
            sqlite.all(`SELECT * FROM ${table}`, (err, rows) => {
                if (err) {
                    // Ignore error if table doesn't exist (e.g. new workout tables might not exist in old db)
                    console.warn(`   ⚠️ Could not read ${table} from SQLite (might be empty/missing).`);
                    resolve([]);
                } else {
                    resolve(rows);
                }
            });
        });

        if (rows.length === 0) {
            console.log(`   Detailed: No data found in ${table}.`);
            continue;
        }

        console.log(`   Found ${rows.length} records. Uploading...`);

        // Clean data if needed (e.g., SQLite Booleans 0/1 -> Supabase Booleans might need checking, 
        // but Supabase usually handles 0/1 as false/true fine if column is boolean, or integer if integer)

        // Batch insert
        const { error } = await supabase.from(table).upsert(rows);

        if (error) {
            console.error(`   ❌ Failed to migrate ${table}:`, error.message);
        } else {
            console.log(`   ✅ Successfully migrated ${table}.`);
        }
    }

    console.log('\n🎉 Migration Complete!');
    sqlite.close();
}

migrate();
