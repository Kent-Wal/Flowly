import express from 'express';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/authRoutes.js';
import plaidRoutes from './routes/plaidRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import { startScheduler } from './tasks/syncScheduler.js';
import prisma from './prismaClient.js';

//start express
const app = express();
const PORT = process.env.PORT || 5000;

// parse JSON request bodies
app.use(express.json());

//routes
app.use('/auth', authRoutes);
app.use('/plaid', plaidRoutes);
app.use('/transactions', transactionRoutes);
// legacy/api compatibility: some frontends call /api/transactions
app.use('/api/transactions', transactionRoutes);
app.use('/accounts', accountRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', db: true });
    } catch (e) {
        res.status(503).json({ status: 'degraded', db: false, error: e?.message || String(e) });
    }
});

// health/root route will be handled after static frontend check below

// Serve frontend if `dist` exists (built Vite output)
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });

    // root should serve frontend when available
    app.get('/', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    // health/root route when frontend isn't built
    app.get('/', (req, res) => {
        res.send('API running — use /auth or the frontend at :5173');
    });
}

async function waitForDb(retries = 5, delayMs = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (e) {
            console.warn(`DB check failed (attempt ${i + 1}/${retries}):`, e?.message || e);
            await new Promise(r => setTimeout(r, delayMs));
        }
    }
    return false;
}

app.listen(PORT, async () => {
    console.log(`Server has started on port: ${PORT}`);
    // start background scheduler for Plaid syncs if DB is reachable
    try {
        const ok = await waitForDb(5, 2000);
        if (ok) {
            startScheduler();
        } else {
            console.warn('Failed to reach database after retries — scheduler will not start');
        }
    } catch (e) {
        console.warn('Failed to start sync scheduler', e?.message || e);
    }
});