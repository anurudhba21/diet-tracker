import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from './db.js';

const app = express();
const PORT = 3000;

app.use(cors());
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

        res.json({ user: { id: user.id, email: user.email, name: user.name, phone: user.phone, height_cm: user.height_cm, dob: user.dob, gender: user.gender, avatar_id: user.avatar_id } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, height_cm, dob, gender, avatar_id } = req.body;

    try {
        const user = await db.updateUser(id, { name, phone, height_cm, dob, gender, avatar_id });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Data Routes ---

app.get('/api/entries', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    try {
        const entries = await db.getEntries(userId);
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/entries', async (req, res) => {
    try {
        const result = await db.saveEntry(req.body);
        res.json({ success: true, entryId: result.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/entries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.deleteEntry(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Goal Routes ---

app.get('/api/goal', async (req, res) => {
    const { userId } = req.query;
    try {
        const row = await db.getGoal(userId);
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/goal', async (req, res) => {
    try {
        await db.saveGoal(req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
