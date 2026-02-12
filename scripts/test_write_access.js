
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

async function testWrite() {
    console.log('🧪 Testing Write Access...');
    const { data, error } = await supabase.from('users').insert({
        email: 'test_write@example.com',
        password_hash: 'test',
        name: 'Test Write'
    }).select();

    if (error) {
        console.error('❌ Write Attempt Failed:', error.message);
        console.log('   (This confirms we need the SERVICE_ROLE key for migration)');
    } else {
        console.log('✅ Write Successful! (Row inserted)');
        // Clean up
        await supabase.from('users').delete().eq('email', 'test_write@example.com');
    }
}

testWrite();
