
import { createClient } from '@supabase/supabase-js';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; // Load dotenv

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../server/.env');
dotenv.config({ path: envPath }); // Ensure env is loaded

const dbPath = path.resolve(__dirname, '../server/diet_tracker.db');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const sqlite = new sqlite3.Database(dbPath);

async function fixMigration() {
    console.log('🔧 Starting Migration Fix...');

    // 1. Get Local User
    const localUser = await new Promise((resolve) => {
        sqlite.get(`SELECT * FROM users`, (err, row) => resolve(row)); // Assuming single user for MVP
    });

    if (!localUser) {
        console.error('❌ No local user found to migrate!');
        return;
    }

    console.log(`👤 Local User: ${localUser.email} (ID: ${localUser.id})`);

    // 2. Check Cloud User
    const { data: cloudUser, error } = await supabase.from('users').select('*').eq('email', localUser.email).single();

    if (cloudUser) {
        console.log(`☁️  Cloud User Found: ${cloudUser.email} (ID: ${cloudUser.id})`);

        if (cloudUser.id !== localUser.id) {
            console.log('⚠️  ID MISMATCH! Deleting conflicting cloud user...');
            // Delete conflicting user
            const { error: delError } = await supabase.from('users').delete().eq('id', cloudUser.id);
            if (delError) console.error('   ❌ Delete Failed:', delError.message);
            else console.log('   ✅ Conflicting user deleted.');
        } else {
            console.log('   IDs match. Proceeding with update...');
        }
    } else {
        console.log('☁️  No conflicting cloud user found.');
    }

    // 3. Re-Migrate User (Force Insert/Upsert)
    console.log('🚀 Uploading Local User...');
    const { error: upsertError } = await supabase.from('users').upsert(localUser);
    if (upsertError) {
        console.error('❌ User Migration Failed:', upsertError.message);
    } else {
        console.log('✅ User Migrated Successfully.');
    }

    // 4. Run Standard Migration for other tables
    const tables = [
        'goals',
        'user_habits',
        'daily_entries',
        'meals',
        'habits',
        'workouts',
        'workout_logs'
    ];

    for (const table of tables) {
        process.stdout.write(`🔄 Migrating ${table}... `);
        const rows = await new Promise((resolve) => {
            sqlite.all(`SELECT * FROM ${table}`, (err, rows) => resolve(rows || []));
        });

        if (rows.length > 0) {
            const { error } = await supabase.from(table).upsert(rows);
            if (error) console.log(`❌ Failed: ${error.message}`);
            else console.log(`✅ ${rows.length} rows.`);
        } else {
            console.log('No data.');
        }
    }

    console.log('\n🎉 Fix Complete! Try logging in now.');
    sqlite.close();
}

fixMigration();
