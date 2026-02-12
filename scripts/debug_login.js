
import { createClient } from '@supabase/supabase-js';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
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

const EMAIL = 'anurudhba21@gmail.com';

async function debugUser() {
    console.log(`🔍 Debugging User: ${EMAIL}`);

    // 1. Get Local User
    const localUser = await new Promise((resolve) => {
        sqlite.get(`SELECT * FROM users WHERE email = ?`, [EMAIL], (err, row) => resolve(row));
    });

    if (!localUser) {
        console.log('❌ User NOT found in LOCAL SQLite!');
        return;
    }
    console.log('✅ Found in LOCAL SQLite.');
    console.log('   Hash:', localUser.password_hash.substring(0, 20) + '...');

    // 2. Get Cloud User
    const { data: cloudUser, error } = await supabase.from('users').select('*').eq('email', EMAIL).single();

    if (error || !cloudUser) {
        console.log('❌ User NOT found in SUPABASE! (or error:', error?.message, ')');
        console.log('   This means migration failed to copy this user.');
    } else {
        console.log('✅ Found in SUPABASE.');
        console.log('   Hash:', cloudUser.password_hash.substring(0, 20) + '...');

        if (localUser.password_hash === cloudUser.password_hash) {
            console.log('✅ Password Hashes MATCH.');
        } else {
            console.log('❌ Password Hashes DO NOT MATCH!');
        }
    }

    sqlite.close();
}

debugUser();
