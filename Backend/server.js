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

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Body parser for JSON

// Routes (later import routes modularly)
app.get('/', (req, res) => {
  res.send('Finance Tracker API is running 🚀');
});

// Inside app middlewares
app.use('/api/auth', authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🔥`));
