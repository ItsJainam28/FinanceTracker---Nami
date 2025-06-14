// server.js: Main entry point for the Finance Tracker API
// This file sets up the Express server, connects to MongoDB, and defines basic routes.

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import recurringExpenseRoutes from './routes/recurringExpenseRoutes.js';
import analyticsRoutes from './routes/analytics.js';
import recurringBudgetRoutes from './routes/recurringBudgetRoutes.js';
import aiRoutes from './routes/ai.js';
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middlewares


// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5000',    // Your backend port
    'https://finance-tracker-frontend-gq1os916u-itsjainam28s-projects.vercel.app/',  // Your Vercel deployment
    'http://localhost:3000',    // React default (if testing locally)
    'http://localhost:5173',    // Vite default (if testing locally)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
};


app.use(cors(corsOptions));
// app.options('/{*}', cors(corsOptions));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Finance Tracker API is running 🚀');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/recurring-expenses', recurringExpenseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recurring-budgets', recurringBudgetRoutes);
app.use("/api/ai", aiRoutes);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🔥`));
