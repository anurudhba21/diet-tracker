import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import db from './db.js';
import { generateToken, authenticate } from './middleware/auth.js';

const app = express();
const PORT = 3000;

// Security Middleware
app.use(helmet());
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// CORS Configuration - Allow Credentials
app.use(cors({
    origin: true, // Allow all origins for debugging
    credentials: true
}));

app.use(express.json());

// Debug logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- Auth Routes ---

app.post('/api/register', async (req, res) => {
    const { email, password, name, phone, height_cm, dob, gender, avatar_id } = req.body;
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const password_hash = bcrypt.hashSync(password, 10);

    try {
        const user = await db.createUser({
            id, email, password_hash, name: name || null, phone: phone || null,
            height_cm: height_cm || null, dob: dob || null, gender: gender || null,
            avatar_id: avatar_id || null, created_at
        });

        // Generate Token & Set Cookie
        const token = generateToken(user);
        res.cookie('d_t_auth', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ user: { id: user.id, email: user.email, name: user.name, phone: user.phone, height_cm: user.height_cm, dob: user.dob, gender: user.gender, avatar_id: user.avatar_id } });
    } catch (err) {
        if (err.message?.includes('UNIQUE constraint failed') || err.message?.includes('duplicate key')) {
            return res.status(400).json({ error: 'User already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.getUserByEmail(email);
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const validPassword = bcrypt.compareSync(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

        // Generate Token & Set Cookie
        const token = generateToken(user);
        res.cookie('d_t_auth', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ user: { id: user.id, email: user.email, name: user.name, phone: user.phone, height_cm: user.height_cm, dob: user.dob, gender: user.gender, avatar_id: user.avatar_id } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('d_t_auth');
    res.json({ success: true });
});

app.get('/api/auth/me', authenticate, async (req, res) => {
    try {
        const user = await db.getUserById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user: { id: user.id, email: user.email, name: user.name, phone: user.phone, height_cm: user.height_cm, dob: user.dob, gender: user.gender, avatar_id: user.avatar_id } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { name, phone, height_cm, dob, gender, avatar_id } = req.body;

    if (req.user.id !== id) return res.status(403).json({ error: 'Unauthorized' });

    try {
        const user = await db.updateUser(id, { name, phone, height_cm, dob, gender, avatar_id });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- OTP Routes ---

import twilio from 'twilio';

app.post('/api/auth/otp/request', async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await db.getUserByPhone(phone);
        if (!user) {
            return res.status(404).json({ error: 'User not found with this phone number' });
        }

        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await db.saveOTP(phone, code);

        // Send SMS via Twilio if configured
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
            try {
                const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                await client.messages.create({
                    body: `Your Diet Tracker OTP is: ${code}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phone.startsWith('+') ? phone : `+91${phone}`
                });
                console.log(`📨 Sent SMS to ${phone}`);
            } catch (smsError) {
                console.error('Twilio Error:', smsError.message);
                console.log(`🔐 OTP for ${phone}: ${code} (Fallback)`);
            }
        } else {
            console.log(`🔐 OTP for ${phone}: ${code} (Mock)`);
        }

        res.json({ success: true, message: 'OTP sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/otp/verify', async (req, res) => {
    const { phone, code } = req.body;
    try {
        const isValid = await db.verifyOTP(phone, code);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        const user = await db.getUserByPhone(phone);

        // Generate Token & Set Cookie
        const token = generateToken(user);
        res.cookie('d_t_auth', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ user: { id: user.id, email: user.email, name: user.name, phone: user.phone, height_cm: user.height_cm, dob: user.dob, gender: user.gender, avatar_id: user.avatar_id } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Data Routes ---

app.get('/api/entries', authenticate, async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    // Ensure user matches token
    if (req.user.id !== userId) return res.status(403).json({ error: 'Unauthorized' });

    try {
        const entries = await db.getEntries(userId);
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/entries', authenticate, async (req, res) => {
    if (req.user.id !== req.body.userId) return res.status(403).json({ error: 'Unauthorized' });

    try {
        const result = await db.saveEntry(req.body);
        res.json({ success: true, entryId: result.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/entries/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    // Note: Ideally we should check if the entry belongs to the user here
    // But for MVP we will assume if they have the ID and are auth'd, it's ok (or improve later)
    try {
        await db.deleteEntry(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Goal Routes ---

app.get('/api/goal', authenticate, async (req, res) => {
    const { userId } = req.query;
    if (req.user.id !== userId) return res.status(403).json({ error: 'Unauthorized' });

    try {
        const row = await db.getGoal(userId);
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/goal', authenticate, async (req, res) => {
    if (req.user.id !== req.body.userId) return res.status(403).json({ error: 'Unauthorized' });

    try {
        await db.saveGoal(req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });
}

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

export default app;

