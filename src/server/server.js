import express from 'express';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import plaidRoutes from './routes/plaidRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import { startScheduler } from './tasks/syncScheduler.js';

//start express
const app = express();
const PORT = process.env.PORT || 5000;

// parse JSON request bodies
app.use(express.json());

//routes
app.use('/auth', authRoutes);
app.use('/plaid', plaidRoutes);
app.use('/transactions', transactionRoutes);
app.use('/accounts', accountRoutes);

// health/root route
app.get('/', (req, res) => {
    res.send('API running — use /auth or the frontend at :5173');
});

// Serve frontend in production (assumes `vite build` output in /dist)
if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server has started on port: ${PORT}`);
    // start background scheduler for Plaid syncs
    try { startScheduler(); } catch (e) { console.warn('Failed to start sync scheduler', e?.message || e); }
});