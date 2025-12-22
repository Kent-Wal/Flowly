import express from 'express';
import authRoutes from './auth/authRoutes.js';

//start express
const app = express();
const PORT = process.env.PORT || 5000;

//routes
app.use('/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server has started on port: ${PORT}`);
});