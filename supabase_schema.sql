-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    height_cm INTEGER,
    dob DATE,
    gender TEXT,
    avatar_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Daily Entries Table (Added junk column for tracking junk food)
CREATE TABLE IF NOT EXISTS daily_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight REAL,
    notes TEXT,
    junk INTEGER DEFAULT 0, -- Track junk food consumption
    UNIQUE(user_id, date)
);

-- 3. Create Meals Table
CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES daily_entries(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- breakfast, lunch, dinner, snack
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Habits Table (Daily Log)
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES daily_entries(id) ON DELETE CASCADE,
    habit_name TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Goals Table
CREATE TABLE IF NOT EXISTS goals (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    start_weight REAL,
    target_weight REAL,
    start_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create User Habits Table (Definitions)
CREATE TABLE IF NOT EXISTS user_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    time_of_day TEXT DEFAULT 'any',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Create OTPS Table (For phone auth)
CREATE TABLE IF NOT EXISTS otps (
    phone TEXT PRIMARY KEY,
    code TEXT,
    expires_at BIGINT -- Using BIGINT for JS Date.now() timestamp
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_habits_user_id ON user_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_id ON daily_entries(user_id);
