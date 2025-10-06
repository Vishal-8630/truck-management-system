import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoute.js';
import billEntryRoutes from './routes/billEntryRoutes.js';
import billingPartyRoutes from './routes/billingPartyRoute.js';
import vehicelEntryRoutes from './routes/vehicleEntryRoutes.js';
import balancePartyRoutes from './routes/balancePartyRoutes.js';

dotenv.config();
connectDB();

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
}

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bill-entry', billEntryRoutes); 
app.use('/api/billing-party', billingPartyRoutes);
app.use('/api/vehicle-entry/', vehicelEntryRoutes);
app.use('/api/balance-party', balancePartyRoutes);

// Error Handling Middleware
app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});
