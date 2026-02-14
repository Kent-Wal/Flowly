import express from 'express';
import authRoutes from './routes/authRoutes.js';
import plaidRoutes from './routes/plaidRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import accountRoutes from './routes/accountRoutes.js';

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

app.listen(PORT, () => {
    console.log(`Server has started on port: ${PORT}`);
});