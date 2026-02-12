
import { createClient } from '@supabase/supabase-js';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../server/.env');
dotenv.config({ path: envPath });

const dbPath = path.resolve(__dirname, '../server/diet_tracker.db');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const sqlite = new sqlite3.Database(dbPath);

async function forceFix() {
    console.log('🔨 Starting Force Fix...');

    // 1. Get Local User
    const localUser = await new Promise((resolve) => {
        sqlite.get(`SELECT * FROM users`, (err, row) => resolve(row));
    });

    if (!localUser) {
        console.error('❌ No local user found!');
        return;
    }

    console.log(`👤 Local User: ${localUser.email} (ID: ${localUser.id})`);
    console.log(`🔑 Local Hash: ${localUser.password_hash.substring(0, 15)}...`);

    // 2. Get Cloud User
    const { data: cloudUser, error } = await supabase.from('users').select('*').eq('email', localUser.email).single();

    if (cloudUser) {
        console.log(`☁️  Cloud User: ${cloudUser.email} (ID: ${cloudUser.id})`);
        console.log(`🔑 Cloud Hash: ${cloudUser.password_hash.substring(0, 15)}...`);

        if (cloudUser.id !== localUser.id || cloudUser.password_hash !== localUser.password_hash) {
            console.log('⚠️  MISMATCH DETECTED. Nuking cloud user data...');

            // Delete USER (should cascade, but let's be sure we want it gone)
            const { error: delError } = await supabase.from('users').delete().eq('id', cloudUser.id);
            if (delError) {
                console.error('❌ Delete Failed:', delError.message);
                // Try deleting dependents manually if needed (omitted for brevity, trusting cascade or service_role)
            } else {
                console.log('✅ Conflicting user deleted.');
            }
        } else {
            console.log('✅ Data matches. No action needed on User.');
        }
    } else {
        console.log('☁️  No cloud user found. Ready to insert.');
    }

    // 3. Insert Local User
    const { error: insertError } = await supabase.from('users').upsert(localUser);
    if (insertError) {
        console.error('❌ User Insert Failed:', insertError.message);
    } else {
        console.log('✅ User Inserted/Updated.');
    }

    // 4. Verify Immediate
    const { data: verifyUser } = await supabase.from('users').select('*').eq('email', localUser.email).single();
    if (verifyUser) {
        console.log(`🧐 Verification: Cloud Hash is now ${verifyUser.password_hash.substring(0, 15)}...`);
        if (verifyUser.password_hash === localUser.password_hash) {
            console.log('🎉 Hashes MATCH!');
        } else {
            console.log('😱 Hashes STILL MISMATCH!');
        }
    }

    // 5. Migrate Data
    const tables = ['goals', 'user_habits', 'daily_entries', 'meals', 'habits', 'workouts', 'workout_logs'];
    for (const table of tables) {
        // ... (standard migration logic)
        const rows = await new Promise((resolve) => {
            sqlite.all(`SELECT * FROM ${table}`, (err, rows) => resolve(rows || []));
        });
        if (rows.length > 0) {
            const { error } = await supabase.from(table).upsert(rows);
            if (error) console.log(`   ❌ ${table}: ${error.message}`);
            else console.log(`   ✅ ${table}: ${rows.length} rows.`);
        }
    }

    sqlite.close();
}

forceFix();
