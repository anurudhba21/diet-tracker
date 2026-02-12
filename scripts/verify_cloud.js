
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../server/.env');
dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkUser() {
    console.log('🔍 Checking for users in Supabase...');
    const { data, error } = await supabase.from('users').select('*');

    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.log(`✅ Found ${data.length} users.`);
        data.forEach(u => console.log(`   - ${u.email} (${u.name})`));
    }
}

checkUser();
