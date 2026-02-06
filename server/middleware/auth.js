import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-env';

export const authenticate = (req, res, next) => {
    const token = req.cookies.d_t_auth;

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};
