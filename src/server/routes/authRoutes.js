import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

const router = express.Router();
// Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Name, email and password are required' });
    }

    // encrypt the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        // Quick existence check to provide immediate 409 for UX (race still handled by unique constraint)
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return res.status(201).json({ token });
    } catch (err) {
        console.error('Register error:', err);

        // handle common Prisma unique constraint error for email (P2002)
        if (err && err.code === 'P2002' && err.meta && err.meta.target && err.meta.target.includes('email')) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const userFound = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!userFound) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const validPassword = bcrypt.compareSync(password, userFound.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Incorrect Password.' });
        }

        const token = jwt.sign({ id: userFound.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return res.status(200).json({ token });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal Server Error', detail: err?.message });
    }
});

export default router;