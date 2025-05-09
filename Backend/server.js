/*
Server.js: Main entry point for the Finance Tracker API
This file sets up the Express server, connects to MongoDB, and defines basic routes.
*/
// Import required modules
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');
const budgetRoutes = require('./routes/budgetRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const recurringExpenseRoutes = require("./routes/recurringExpenseRoutes.js");
const analyticsRoutes = require("./routes/analytics");
const recurringBudgetRoutes = require('./routes/recurringBudgetRoutes');
// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Body parser for JSON

// Routes (API Endpoints)
app.get('/', (req, res) => {
  res.send('Finance Tracker API is running 🚀');
});
// Inside app middlewares
app.use('/api/auth', authRoutes);
// Budget Routes
app.use('/api/budgets',budgetRoutes);
// Expense Routes
app.use('/api/expenses', expenseRoutes);
// Category Routes
app.use('/api/categories', categoryRoutes);
// Recurring Expense Routes
app.use("/api/recurring-expenses", recurringExpenseRoutes);
// Analytics Routes
app.use("/api/analytics", analyticsRoutes);
// Recurring Budget Routes
app.use('/api/recurring-budgets', require('./routes/recurringBudgetRoutes'));
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🔥`));
